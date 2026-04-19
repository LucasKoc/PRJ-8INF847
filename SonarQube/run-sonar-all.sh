#!/usr/bin/env bash
# ==========================================================================
# run-sonar-all.sh — Analyse SonarQube complète (Backend + Frontend + Selenium)
# ==========================================================================
# Utilisé dans le pipeline Jenkins pour la stage "Quality".
# Le pipeline échoue si le Quality Gate n'est pas passé (propriété
# sonar.qualitygate.wait=true dans chaque projet).
# ==========================================================================

set -e

if [ -z "$SONAR_TOKEN" ]; then
    echo "SONAR_TOKEN manquant"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1/3 — Analyse Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"$SCRIPT_DIR/run-sonar-backend.sh"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2/3 — Analyse Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"$SCRIPT_DIR/run-sonar-frontend.sh"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3/3 — Analyse Selenium"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$SCRIPT_DIR/../Selenium"
docker run --rm \
    --network host \
    -e SONAR_HOST_URL="http://localhost:9000" \
    -e SONAR_TOKEN="$SONAR_TOKEN" \
    -v "$(pwd):/usr/src" \
    sonarsource/sonar-scanner-cli:latest

echo ""
echo "Les 3 analyses sont terminées."
echo "   Dashboard global : http://localhost:9000/projects"
