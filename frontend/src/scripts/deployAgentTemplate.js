export const generateDeployScript = (ip, port, password) => {
  return `#!/bin/bash
# Script de déploiement d'agent
# Nécessite les privilèges root

# Vérification des privilèges root
if [ "$(id -u)" != "0" ]; then
  echo "[ERROR] Ce script doit être exécuté en tant que root" >&2
  exit 1
fi

# Configuration
SERVER_IP="${ip.trim()}"
SSH_PORT="${port.trim()}"
TEMP_USER="fennec_user"
PASSWORD="${password}"
ANALYSIS_DIR="/home/$TEMP_USER/analysis"
LOCK_FILE="/tmp/agent_$TEMP_USER.lock"
STATIC_INFO_FILE="$ANALYSIS_DIR/static_info.txt"
METRICS_FILE="$ANALYSIS_DIR/system_metrics.txt"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "======================================"
    echo "[ALERTE] Nettoyage en cours..."
    echo "======================================"
    sudo pkill -u $TEMP_USER 2>/dev/null
    sudo userdel -rf $TEMP_USER >/dev/null 2>&1
    sudo rm -f /etc/sudoers.d/$TEMP_USER
    sudo rm -f $LOCK_FILE
    sudo rm -f "$ANALYSIS_DIR/monitor_metrics.sh"
    sudo crontab -u $TEMP_USER -r >/dev/null 2>&1
    echo "[INFO] Utilisateur temporaire et fichiers supprimés"
    exit 1
}

# Capture des signaux + surveillance clavier
trap cleanup INT TERM
# Si l'utilisateur appuie sur Entrée, on lance le nettoyage
read -t 1 -n 1 key && [ "$key" = "" ] && cleanup

# Création du fichier verrou
echo $TEMP_USER | sudo tee $LOCK_FILE >/dev/null

echo "======================================"
echo "[INFO] Démarrage du déploiement vers $SERVER_IP:$SSH_PORT"
echo "======================================"
echo "[INFO] Création de l'utilisateur temporaire : $TEMP_USER"

# Supprimer l'utilisateur existant
if id "$TEMP_USER" &>/dev/null; then
    echo "[WARN] Utilisateur existant détecté - suppression..."
    cleanup
fi

# Création de l'utilisateur temporaire
sudo useradd -m -s /bin/bash $TEMP_USER || { echo "[ERROR] Échec de création utilisateur"; exit 1; }

# Définition du mot de passe
echo "$TEMP_USER:$PASSWORD" | sudo chpasswd || { echo "[ERROR] Échec de définition du mot de passe"; exit 1; }

# Attribution des privilèges
echo "$TEMP_USER ALL=(ALL) NOPASSWD: /usr/bin/lsof, /usr/bin/df, /usr/bin/uname, /usr/bin/tar, /usr/bin/cp, /usr/bin/journalctl" | sudo tee /etc/sudoers.d/$TEMP_USER >/dev/null
sudo chmod 0440 /etc/sudoers.d/$TEMP_USER

# Création du répertoire d'analyse
sudo mkdir -p $ANALYSIS_DIR
sudo chown $TEMP_USER:$TEMP_USER $ANALYSIS_DIR

echo "[INFO] Utilisateur créé avec mot de passe : $PASSWORD"
echo "[INFO] Utilisez ce mot de passe pour les connexions SSH"

# Fichier d'informations statiques
echo "[INFO] Création du fichier d'informations statiques..."
sudo -u $TEMP_USER bash -c '
    PUBLIC_IP=\$(curl -s ifconfig.me)
    [ -z "\$PUBLIC_IP" ] && PUBLIC_IP="Non disponible"
    
    PRIVATE_IP=\$(hostname -I | awk "{print \\$1}")
    [ -z "\$PRIVATE_IP" ] && PRIVATE_IP="Non disponible"

    VPN_ACTIVE="Non"
    if ip a | grep -q tun0 || ip a | grep -q wg0; then
        VPN_ACTIVE="Oui"
    fi

    KERNEL_VERSION="\$(uname -r)"
    OS_NAME="\$(lsb_release -d | cut -d":" -f2 | xargs)"
    
    echo "Adresse IP Publique" > "'$STATIC_INFO_FILE'"
    echo "\$PUBLIC_IP" >> "'$STATIC_INFO_FILE'"
    echo "VPN Actif" >> "'$STATIC_INFO_FILE'"
    echo "\$VPN_ACTIVE" >> "'$STATIC_INFO_FILE'"
    echo "Version Logiciel" >> "'$STATIC_INFO_FILE'"
    echo "\$KERNEL_VERSION" >> "'$STATIC_INFO_FILE'"
    echo "Système d exploitation" >> "'$STATIC_INFO_FILE'"
    echo "\$OS_NAME" >> "'$STATIC_INFO_FILE'"
    echo "Adresse IP Privée" >> "'$STATIC_INFO_FILE'"
    echo "\$PRIVATE_IP" >> "'$STATIC_INFO_FILE'"
    echo "Dernière connexion" >> "'$STATIC_INFO_FILE'"   # <-- ADDED
    echo "Aucune connexion" >> "'$STATIC_INFO_FILE'"     # <-- ADDED
'

# Script de surveillance des métriques
echo "[INFO] Création du script de surveillance..."
sudo -u $TEMP_USER tee "$ANALYSIS_DIR/monitor_metrics.sh" >/dev/null <<'EOF'
#!/bin/bash
METRICS_FILE="$HOME/analysis/system_metrics.txt"

CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\\1/" | awk '{print 100 - $1}')
CPU_USAGE=$(printf "%.1f" "$CPU_USAGE")

MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
MEM_USED_GB=$(echo "scale=1; $MEM_USED/1024" | bc)
MEM_TOTAL_GB=$(echo "scale=1; $MEM_TOTAL/1024" | bc)

DISK_INFO=$(df -BG / | awk 'NR==2 {print $4, $2}' | tr -d 'G')
DISK_FREE=$(echo $DISK_INFO | awk '{print $1}')
DISK_TOTAL=$(echo $DISK_INFO | awk '{print $2}')

UPTIME=$(uptime -p | sed 's/up //')

echo "Utilisation du CPU" > $METRICS_FILE
echo "\${CPU_USAGE}%" >> $METRICS_FILE
echo "Utilisation de la mémoire" >> $METRICS_FILE
echo "\${MEM_USED_GB} Go sur \${MEM_TOTAL_GB} Go" >> $METRICS_FILE
echo "Espace disque libre" >> $METRICS_FILE
echo "\${DISK_FREE} Go / \${DISK_TOTAL} Go" >> $METRICS_FILE
echo "Temps de fonctionnement (uptime)" >> $METRICS_FILE
echo "$UPTIME" >> $METRICS_FILE
EOF

sudo chmod +x "$ANALYSIS_DIR/monitor_metrics.sh"

# Script pour enregistrer les connexions SSH
echo "[INFO] Configuration du suivi des connexions SSH..."
sudo -u $TEMP_USER tee "/home/$TEMP_USER/.bash_profile" >/dev/null <<'EOF'
#!/bin/bash
if [ -n "$SSH_CONNECTION" ]; then
    # Update last login in static info
    sed -i '/^Dernière connexion$/{n;s/.*/'"$(date '+%Y-%m-%d %H:%M:%S')"'/}' "$HOME/analysis/static_info.txt"
    $HOME/analysis/monitor_metrics.sh
fi
EOF

# Premier lancement
sudo -u $TEMP_USER "$ANALYSIS_DIR/monitor_metrics.sh"

# Planification toutes les 5 minutes
(crontab -u $TEMP_USER -l 2>/dev/null; echo "*/5 * * * * $ANALYSIS_DIR/monitor_metrics.sh") | crontab -u $TEMP_USER -

# Suppression automatique après 24h
echo "[INFO] Le compte sera automatiquement supprimé dans 24 heures"
echo "sudo userdel -r $TEMP_USER && sudo rm -f /etc/sudoers.d/$TEMP_USER" | sudo at now + 24 hours >/dev/null 2>&1

# Suppression du verrou
sudo rm -f $LOCK_FILE

echo ""
echo "======================================"
echo "[SUCCESS] Déploiement terminé"
echo "Utilisateur: $TEMP_USER"
echo "Mot de passe: $PASSWORD"
echo "Commande: ssh -p $SSH_PORT $TEMP_USER@$SERVER_IP"
echo "======================================"
`;
};