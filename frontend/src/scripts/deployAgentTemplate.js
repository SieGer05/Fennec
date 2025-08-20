export const generateDeployScript = (ip, port, publicKey) => {
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
PUBLIC_KEY="${publicKey}"
ANALYSIS_DIR="/home/$TEMP_USER/analysis"
LOCK_FILE="/tmp/agent_$TEMP_USER.lock"
STATIC_INFO_FILE="$ANALYSIS_DIR/static_info.txt"
METRICS_FILE="$ANALYSIS_DIR/system_metrics.txt"
SERVICE_STATUS_FILE="$ANALYSIS_DIR/service_status.txt"

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
sudo useradd -m -s /bin/bash $TEMP_USER || { 
    echo "[ERROR] Échec de création utilisateur"
    exit 1
}

# Configuration de la clé publique
echo "[INFO] Configuration de l'authentification par clé publique"
sudo -u $TEMP_USER mkdir -p /home/$TEMP_USER/.ssh
echo "$PUBLIC_KEY" | sudo -u $TEMP_USER tee /home/$TEMP_USER/.ssh/authorized_keys >/dev/null
sudo chmod 700 /home/$TEMP_USER/.ssh
sudo chmod 600 /home/$TEMP_USER/.ssh/authorized_keys
sudo chown -R $TEMP_USER:$TEMP_USER /home/$TEMP_USER/.ssh

# Attribution des privilèges
SSHD_PATH=$(command -v sshd)
SUDO_COMMANDS="/usr/bin/lsof, /usr/bin/df, /usr/bin/uname, /usr/bin/tar, /usr/bin/cp, /usr/bin/journalctl, /usr/bin/systemctl, $SSHD_PATH -T"

echo "$TEMP_USER ALL=(ALL) NOPASSWD: $SUDO_COMMANDS" | sudo tee /etc/sudoers.d/$TEMP_USER >/dev/null
sudo chmod 0440 /etc/sudoers.d/$TEMP_USER

# Webmin audit permissions - allows fennec_user to read Webmin config files for security auditing
echo "$TEMP_USER ALL=(root) NOPASSWD: /bin/cat /etc/webmin/miniserv.conf" | sudo tee -a /etc/sudoers.d/$TEMP_USER >/dev/null
echo "$TEMP_USER ALL=(root) NOPASSWD: /bin/cat /etc/webmin/config" | sudo tee -a /etc/sudoers.d/$TEMP_USER >/dev/null
echo "$TEMP_USER ALL=(root) NOPASSWD: /bin/cat /etc/webmin/authentic-theme/config" | sudo tee -a /etc/sudoers.d/$TEMP_USER >/dev/null
echo "$TEMP_USER ALL=(root) NOPASSWD: /bin/cat /etc/webmin/webmin.acl" | sudo tee -a /etc/sudoers.d/$TEMP_USER >/dev/null

# Création du répertoire d'analyse
sudo mkdir -p $ANALYSIS_DIR
sudo chown $TEMP_USER:$TEMP_USER $ANALYSIS_DIR

echo "[INFO] Clé publique configurée pour l'utilisateur: $TEMP_USER"

# Fichier d'informations statiques
echo "[INFO] Création du fichier d'informations statiques..."
sudo -u $TEMP_USER bash -c '
    PUBLIC_IP=$(curl -s ifconfig.me)
    [ -z "$PUBLIC_IP" ] && PUBLIC_IP="Non disponible"
    
    PRIVATE_IP=$(hostname -I | awk "{print \\$1}")
    [ -z "$PRIVATE_IP" ] && PRIVATE_IP="Non disponible"

    VPN_ACTIVE="Non"
    if ip a | grep -q tun0 || ip a | grep -q wg0; then
        VPN_ACTIVE="Oui"
    fi

    KERNEL_VERSION="$(uname -r)"
    OS_NAME="$(lsb_release -d | cut -d":" -f2 | xargs)"
    
    echo "Adresse IP Publique" > "'$STATIC_INFO_FILE'"
    echo "$PUBLIC_IP" >> "'$STATIC_INFO_FILE'"
    echo "VPN Actif" >> "'$STATIC_INFO_FILE'"
    echo "$VPN_ACTIVE" >> "'$STATIC_INFO_FILE'"
    echo "Version Logiciel" >> "'$STATIC_INFO_FILE'"
    echo "$KERNEL_VERSION" >> "'$STATIC_INFO_FILE'"
    echo "Système d exploitation" >> "'$STATIC_INFO_FILE'"
    echo "$OS_NAME" >> "'$STATIC_INFO_FILE'"
    echo "Adresse IP Privée" >> "'$STATIC_INFO_FILE'"
    echo "$PRIVATE_IP" >> "'$STATIC_INFO_FILE'"
    echo "Dernière connexion" >> "'$STATIC_INFO_FILE'"
    echo "Aucune connexion" >> "'$STATIC_INFO_FILE'"
'

# Script de surveillance des métriques
echo "[INFO] Création du script de surveillance..."
sudo -u $TEMP_USER tee "$ANALYSIS_DIR/monitor_metrics.sh" >/dev/null <<'EOF'
#!/bin/bash
METRICS_FILE="$HOME/analysis/system_metrics.txt"
SERVICE_STATUS_FILE="$HOME/analysis/service_status.txt"

CPU_USAGE=$(top -bn1 | awk -F, '
    /Cpu\(s\):/ {
        for(i=1; i<=NF; i++) { 
            if ($i ~ /id/) { 
                gsub(/[^0-9.]/, "", $i)
                idle = $i
            } 
        } 
    } 
    END { 
        usage = 100 - idle
        printf "%.1f", usage 
    }'
)
CPU_USAGE=$(printf "%.1f" "$CPU_USAGE")

MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
MEM_USED_GB=$(awk -v used="$MEM_USED" 'BEGIN {printf "%0.1f", used/1024}')
MEM_TOTAL_GB=$(awk -v total="$MEM_TOTAL" 'BEGIN {printf "%0.1f", total/1024}')

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

# Dynamically detect and check status of all services
SERVICE_NAMES=("ssh" "nginx" "apache2" "mariadb" "webmin")

> $SERVICE_STATUS_FILE # Clear previous content
for service_name in "\${SERVICE_NAMES[@]}"; do
    if systemctl list-unit-files --type=service | grep -q "^$service_name.service"; then
        if systemctl is-active --quiet "$service_name"; then
            echo "$service_name active" >> $SERVICE_STATUS_FILE
        else
            echo "$service_name inactive" >> $SERVICE_STATUS_FILE
        fi
    else
        echo "$service_name not exist" >> $SERVICE_STATUS_FILE
    fi
done
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
echo "Commande: ssh -p $SSH_PORT $TEMP_USER@$SERVER_IP"
echo "======================================"
`;
};