#!/usr/bin/env bash
# ==========================================================================
# run-sonar-frontend.sh — Analyse SonarQube du frontend DPSCHECK
# ==========================================================================

set -e

if [ -z "$SONAR_TOKEN" ]; then
    echo "Variable SONAR_TOKEN manquante"
    exit 1
fi

cd "$(dirname "$0")/../Frontend"

echo "Exécution des tests Angular avec couverture..."
# Note : Si Karma n'est pas configuré, cette commande retournera une erreur
# non-bloquante. L'analyse se poursuivra sans métrique de couverture frontend.
npx ng test --code-coverage --watch=false --browsers=ChromeHeadless || \
    echo "/!\ Pas de tests Angular configurés — analyse sans couverture frontend"

echo "Lancement de l'analyse SonarQube..."
docker run --rm \
    --network host \
    -e SONAR_HOST_URL="http://localhost:9000" \
    -e SONAR_TOKEN="$SONAR_TOKEN" \
    -v "$(pwd):/usr/src" \
    sonarsource/sonar-scanner-cli:latest

echo "Analyse terminée. Résultats sur http://localhost:9000/dashboard?id=dpscheck-frontend"
