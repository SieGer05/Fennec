export const getHashInfoText = (sha256Hash) => `
    Ceci est le hash SHA-256 de votre agent :  
    ${sha256Hash}

    Pour vérifier l'intégrité du fichier :

    - Sous Linux / MacOS :
    1. Placez le script "deploy_agent.sh" dans un dossier.
    2. Ouvrez un terminal et exécutez :
    sha256sum deploy_agent.sh
    3. Comparez le hash affiché avec celui ci-dessus.

    - Sous Windows (sans logiciel) :
    1. Allez sur le site : https://emn178.github.io/online-tools/sha256_checksum.html
    2. Glissez-déposez votre fichier "deploy_agent.sh".
    3. Comparez le hash obtenu avec celui ci-dessus.
`.trim();