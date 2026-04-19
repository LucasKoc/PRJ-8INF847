#!/usr/bin/env bash
# ==========================================================================
# run-sonar-backend.sh — Analyse SonarQube du backend DPSCHECK
# ==========================================================================
# Pré-requis :
#   - SonarQube démarré (docker compose -f docker-compose.sonarqube.yaml up -d)
#   - Un token d'authentification SonarQube exporté dans SONAR_TOKEN
#     (Créer le token dans SonarQube : Mon compte → Sécurité → Generate)
#
# Usage :
#   export SONAR_TOKEN=sqp_xxxxxxxxxxxxxxxxxxxxxxxxxx
#   ./run-sonar-backend.sh
# ==========================================================================

set -e

# Vérifications préalables
if [ -z "$SONAR_TOKEN" ]; then
    echo "Variable SONAR_TOKEN manquante"
    echo "   Générer un token sur http://localhost:9000/account/security"
    echo "   Puis : export SONAR_TOKEN=<token>"
    exit 1
fi

# Localiser le dossier Backend (relatif à la racine du projet)
cd "$(dirname "$0")/../Backend"

echo "Exécution des tests unitaires avec couverture..."
npm run test:cov

echo "Lancement de l'analyse SonarQube..."
docker run --rm \
    --network host \
    -e SONAR_HOST_URL="http://localhost:9000" \
    -e SONAR_TOKEN="$SONAR_TOKEN" \
    -v "$(pwd):/usr/src" \
    sonarsource/sonar-scanner-cli:latest

echo "Analyse terminée. Résultats sur http://localhost:9000/dashboard?id=dpscheck-backend"
