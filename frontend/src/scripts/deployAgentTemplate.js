export const generateDeployScript = (ip, port) => {
  return `#!/bin/bash
# Script de déploiement d'agent
# Généré le : ${new Date().toLocaleString()}

# Configuration
SERVER_IP="${ip.trim()}"
SSH_PORT="${port.trim()}"
TEMP_USER="analyst_$(date +%s)"
PASSWORD="$(openssl rand -base64 12 | tr -d '/+=' | cut -c1-16)"
ANALYSIS_DIR="/home/$TEMP_USER/analysis"
LOCK_FILE="/tmp/agent_$TEMP_USER.lock"
STATIC_INFO_FILE="$ANALYSIS_DIR/static_info.txt"
METRICS_FILE="$ANALYSIS_DIR/system_metrics.txt"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "⚠️  Script interrompu ! Nettoyage d'urgence..."
    sudo pkill -u $TEMP_USER
    sudo userdel -rf $TEMP_USER >/dev/null 2>&1
    sudo rm -f /etc/sudoers.d/$TEMP_USER
    sudo rm -f $LOCK_FILE
    sudo rm -f "$ANALYSIS_DIR/monitor_metrics.sh"
    sudo crontab -u $TEMP_USER -r >/dev/null 2>&1
    echo "✅ Utilisateur temporaire et fichiers supprimés"
    exit 1
}

# Traitement des signaux d'interruption
trap cleanup INT TERM

# Création du fichier verrou
echo $TEMP_USER | sudo tee $LOCK_FILE >/dev/null

echo "🔧 Démarrage du déploiement vers $SERVER_IP:$SSH_PORT"
echo "⏳ Création de l'utilisateur temporaire : $TEMP_USER"

# Création de l'utilisateur temporaire
sudo useradd -m -s /bin/bash $TEMP_USER || { echo "❌ Échec de création utilisateur"; exit 1; }

# Définition du mot de passe
echo "$TEMP_USER:$PASSWORD" | sudo chpasswd || { echo "❌ Échec de définition du mot de passe"; exit 1; }

# Attribution des privilèges
echo "$TEMP_USER ALL=(ALL) NOPASSWD: /usr/bin/lsof, /usr/bin/df, /usr/bin/uname, /usr/bin/tar, /usr/bin/cp, /usr/bin/journalctl" | sudo tee /etc/sudoers.d/$TEMP_USER >/dev/null
sudo chmod 0440 /etc/sudoers.d/$TEMP_USER

# Création du répertoire d'analyse
sudo mkdir -p $ANALYSIS_DIR
sudo chown $TEMP_USER:$TEMP_USER $ANALYSIS_DIR

echo "✅ Utilisateur créé avec mot de passe : $PASSWORD"
echo "🔑 Utilisez ce mot de passe pour les connexions SSH"

# Fichier d'informations dynamiques
echo "📝 Création du fichier d'informations dynamiques..."
sudo -u $TEMP_USER bash -c '
    # Adresse IP publique
    PUBLIC_IP=$(curl -s ifconfig.me)
    [ -z "$PUBLIC_IP" ] && PUBLIC_IP="Non disponible"
    
    # Vérification VPN
    VPN_ACTIVE="Non"
    if ip a | grep -q tun0 || ip a | grep -q wg0; then
        VPN_ACTIVE="Oui"
    fi

    # Version logiciel (kernel)
    KERNEL_VERSION="$(uname -r)"
    
    # Système d exploitation
    OS_NAME="$(lsb_release -d | cut -d":" -f2 | xargs)"
    
    # Écrire le fichier
    echo "Addresse IP" > "'$STATIC_INFO_FILE'"
    echo "$PUBLIC_IP" >> "'$STATIC_INFO_FILE'"
    echo "VPN Actif" >> "'$STATIC_INFO_FILE'"
    echo "$VPN_ACTIVE" >> "'$STATIC_INFO_FILE'"
    echo "Version Logiciel" >> "'$STATIC_INFO_FILE'"
    echo "$KERNEL_VERSION" >> "'$STATIC_INFO_FILE'"
    echo "Système d exploitation" >> "'$STATIC_INFO_FILE'"
    echo "$OS_NAME" >> "'$STATIC_INFO_FILE'"
    echo "Nom de l Agent" >> "'$STATIC_INFO_FILE'"
    echo "Agent Serveur – Casablanca" >> "'$STATIC_INFO_FILE'"
'

# Script de surveillance des métriques
echo "📊 Création du script de surveillance..."
sudo -u $TEMP_USER tee "$ANALYSIS_DIR/monitor_metrics.sh" >/dev/null <<'EOF'
#!/bin/bash
METRICS_FILE="$HOME/analysis/system_metrics.txt"
LAST_LOGIN_FILE="$HOME/analysis/last_login.txt"

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}')

# Mémoire
MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
MEM_PERCENT=$((MEM_USED*100/MEM_TOTAL))

# Disque
DISK_INFO=$(df -BG / | awk 'NR==2 {print $4, $2}' | tr -d 'G')
DISK_FREE=$(echo $DISK_INFO | awk '{print $1}')
DISK_TOTAL=$(echo $DISK_INFO | awk '{print $2}')

# Uptime
UPTIME=$(uptime -p | sed 's/up //')

# Dernière connexion SSH
if [ -f "$LAST_LOGIN_FILE" ]; then
    LAST_LOGIN=$(cat "$LAST_LOGIN_FILE")
else
    LAST_LOGIN="Aucune connexion"
fi

# Écriture des métriques
echo "Utilisation du CPU" > $METRICS_FILE
echo "$CPU_USAGE%" >> $METRICS_FILE
echo "Utilisation de la mémoire" >> $METRICS_FILE
echo "$(echo "scale=1; $MEM_USED/1024" | bc) Go sur $(echo "scale=1; $MEM_TOTAL/1024" | bc) Go" >> $METRICS_FILE
echo "Espace disque libre" >> $METRICS_FILE
echo "$DISK_FREE Go / $DISK_TOTAL Go" >> $METRICS_FILE
echo "Temps de fonctionnement (uptime)" >> $METRICS_FILE
echo "$UPTIME" >> $METRICS_FILE
echo "Dernière connexion" >> $METRICS_FILE
echo "$LAST_LOGIN" >> $METRICS_FILE
EOF

# Rendre le script exécutable
sudo chmod +x "$ANALYSIS_DIR/monitor_metrics.sh"

# Script pour enregistrer les connexions SSH
echo "🔒 Configuration du suivi des connexions SSH..."
sudo -u $TEMP_USER tee "/home/$TEMP_USER/.bash_profile" >/dev/null <<'EOF'
#!/bin/bash
if [ -n "$SSH_CONNECTION" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$HOME/analysis/last_login.txt"
    $HOME/analysis/monitor_metrics.sh
fi
EOF

# Premier lancement
sudo -u $TEMP_USER "$ANALYSIS_DIR/monitor_metrics.sh"

# Planification toutes les 5 minutes
(crontab -u $TEMP_USER -l 2>/dev/null; echo "*/5 * * * * $ANALYSIS_DIR/monitor_metrics.sh") | crontab -u $TEMP_USER -

# Collecte des informations système supplémentaires
echo "📊 Collecte des données de configuration..."
sudo -u $TEMP_USER sh -c '
    uname -a >> $HOME/analysis/system_info.txt
    df -h > $HOME/analysis/disk_usage.txt
    sudo lsof -i :$SSH_PORT > $HOME/analysis/port_$SSH_PORT.txt 2>/dev/null
    
    for conf in /etc/ssh/sshd_config /etc/sysctl.conf /etc/resolv.conf /etc/hosts; do
        if [ -f "$conf" ]; then
            sudo cp "$conf" "$HOME/analysis/"
        fi
    done

    systemctl list-units --type=service --no-pager > $HOME/analysis/services.txt
    journalctl -u ssh --no-pager > $HOME/analysis/ssh_logs.txt
'

# Archivage des résultats
echo "📦 Archivage des données d'analyse..."
sudo -u $TEMP_USER tar -czf /tmp/analysis_snapshot_$TEMP_USER.tar.gz -C $ANALYSIS_DIR .

# Instructions de connexion
echo ""
echo "💡 Utilisez ces identifiants pour vous connecter :"
echo "   Utilisateur: $TEMP_USER"
echo "   Mot de passe: $PASSWORD"
echo "   Commande: ssh -p $SSH_PORT $TEMP_USER@$SERVER_IP"

# Programmation de la suppression
echo "🕒 Le compte sera automatiquement supprimé dans 24 heures"
echo "sudo userdel -r $TEMP_USER && sudo rm -f /etc/sudoers.d/$TEMP_USER" | sudo at now + 24 hours >/dev/null 2>&1

# Suppression du verrou
sudo rm -f $LOCK_FILE

echo ""
echo "✅ Déploiement terminé ! Connexion possible pour l'analyse"
`;
};