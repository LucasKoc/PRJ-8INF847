# Pipeline Jenkins CI/CD — DPSCHECK

Pipeline en **14 étapes** orchestrant l'ensemble de la chaîne CI/CD DPSCHECK :
compilation, tests (unitaires + intégration + fonctionnels), analyse statique,
construction Docker, scans sécurité et déploiement automatisé via Ansible.

## Structure des fichiers livrés

```
DSPCHECK/
├── Jenkinsfile                          ← Pipeline déclaratif (14 étapes)
├── docker-compose.jenkins.yaml          ← Jenkins en Docker pour tests locaux
├── jenkins-docker/
│   ├── Dockerfile                       ← Image Jenkins custom (+ Node + Docker + Ansible)
│   └── plugins.txt                      ← Plugins Jenkins pré-installés
├── ansible/
│   ├── deploy.yaml                      ← Playbook principal
│   ├── templates/
│   │   └── docker-compose.j2            ← Template docker-compose déployé
│   └── inventories/
│       ├── dev/hosts.yaml               ← Inventaire DEV (localhost)
│       ├── rct/hosts.yaml               ← Inventaire RCT
│       ├── pprd/hosts.yaml              ← Inventaire PPRD
│       └── prd/hosts.yaml               ← Inventaire PRD
└── BACKEND_PATCH.md                     ← Patch jest-junit pour Backend/
```

## Vue d'ensemble du pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│ 1. Checkout          → git clone + git log                         │
│ 2. Build             → npm ci + build (Backend ∥ Frontend)         │
│ 3. Validation        → ESLint (Backend ∥ Frontend)                 │
│ 4. Tests unitaires   → Jest + couverture + rapport JUnit           │
│ 5. Tests intégration → docker-compose.integration-test + Supertest │
│ 6. Tests fonctionnels → docker-compose.selenium + Selenium E2E     │
│ 7. Cleanup           → docker compose down + prune                 │
│ 8. Quality           → SonarQube + Quality Gate bloquant           │
│ 9. Docker build      → images Backend + Frontend                   │
│ 10. Trivy scan       → vulns HIGH/CRITICAL sur les images          │
│ 11. Blackduck SCA    → npm audit (alternatif open source)          │
│ 12. Docker publish   → push vers Docker Hub (main/develop only)    │
│ 13. Prepare          → choix env via input (timeout 2 min → DEV)   │
│ 14. Deployment       → ansible-playbook vers env sélectionné       │
└────────────────────────────────────────────────────────────────────┘
```

## Installation — Jenkins local en Docker

### 1. Démarrer Jenkins

Depuis la racine du projet DPSCHECK :

```bash
docker compose -f docker-compose.jenkins.yaml up -d --build
```

⚠ Le premier build prend ~3 minutes (installation de Node 20 + Chrome + Ansible).

### 2. Récupérer le mot de passe admin initial

```bash
docker logs dpscheck_jenkins 2>&1 | grep -A 2 "Please use the following password"
# Ou directement :
docker exec dpscheck_jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Configuration initiale

1. Ouvrir **http://localhost:8080**
2. Coller le mot de passe récupéré
3. Choisir **"Install suggested plugins"** (les plugins métier DPSCHECK sont déjà pré-installés)
4. Créer un utilisateur admin
5. URL Jenkins : `http://localhost:8080` (valeur par défaut)

### 4. Configurer les credentials (Manage Jenkins → Credentials → System → Global)

| ID credential | Type | Contenu |
|---|---|---|
| `sonar-token` | Secret text | Token SonarQube (généré sur http://localhost:9000/account/security) |
| `dockerhub-creds` | Username with password | Username + password/token Docker Hub |
| `ansible-ssh-key` | SSH Username with private key | Clé SSH pour accès aux serveurs RCT/PPRD/PRD |

**Note** : pour une démo en local, seul `sonar-token` est nécessaire (les deux autres
peuvent être créés avec des valeurs fictives — le pipeline gère leur absence).

### 5. Configurer le serveur SonarQube dans Jenkins

Manage Jenkins → System → **SonarQube servers** :
- Name : `SonarQube`
- Server URL : `http://host.docker.internal:9000`
- Server authentication token : sélectionner `sonar-token`

### 6. Créer le job Pipeline

1. **New Item** → nom : `dpscheck-pipeline` → type : **Pipeline** → OK
2. Section **Pipeline** :
   - Definition : `Pipeline script from SCM`
   - SCM : `Git`
   - Repository URL : URL de ton repo GitHub DPSCHECK
   - Branch : `*/main` (ou `*/master`)
   - Script Path : `Jenkinsfile`
3. **Save**
4. Cliquer **Build Now**

## Pré-requis avant de lancer le pipeline

### Appliquer le patch `jest-junit` sur le Backend

Voir `BACKEND_PATCH.md`. Résumé :

```bash
cd Backend
npm install --save-dev jest-junit
```

Puis ajouter `jest-junit` aux reporters dans la section `jest` de `package.json`
(voir le fichier patch pour le snippet exact).

### S'assurer que SonarQube est démarré

```bash
docker compose -f docker-compose.sonarqube.yaml up -d
# Attendre ~2 min la première fois
curl -sf http://localhost:9000 || echo "SonarQube pas encore prêt"
```

## Exécuter le pipeline localement (sans Jenkins)

Pour valider le Jenkinsfile avant de l'intégrer à Jenkins, on peut simuler
les commandes manuellement :

```bash
# Étape 2 — Build
cd Backend && npm ci && npm run build && cd ..
cd Frontend && npm ci && npm run build && cd ..

# Étape 4 — Tests unitaires
cd Backend && npm run test:cov && cd ..

# Étape 5 — Tests intégration
docker compose -f docker-compose.integration-test.yaml up -d
cd Backend && npm run test:e2e && cd ..
docker compose -f docker-compose.integration-test.yaml down -v

# Étape 6 — Tests fonctionnels
docker compose -f docker-compose.selenium.yaml up -d --build
cd Selenium && npm ci && npm test && cd ..
docker compose -f docker-compose.selenium.yaml down -v

# Étape 8 — SonarQube
export SONAR_TOKEN=sqp_xxxxxxxx
./SonarQube/run-sonar-all.sh

# Étape 9 — Docker build
docker build -t kocoglulucas/dpscheck-backend:local ./Backend
docker build -t kocoglulucas/dpscheck-frontend:local ./Frontend

# Étape 14 — Déploiement local (DEV)
ansible-playbook \
    -i ansible/inventories/dev/hosts.yaml \
    --connection=local \
    --extra-vars 'image_tag=local target_env=dev' \
    ansible/deploy.yaml
```

## Paramètres du pipeline (visible au lancement)

| Paramètre | Défaut | Rôle |
|---|---|---|
| `SKIP_DEPLOYMENT` | `false` | Passer les étapes 13 + 14 |
| `SKIP_DOCKER_PUBLISH` | `true` | Passer l'étape 12 (nécessite credentials Docker Hub) |

## Stratégie de branches et déploiement

| Branche | Étape 12 (push Docker Hub) | Étape 13 (prompt env) | Environnements typiques |
|---|---|---|---|
| `feature/*` | ❌ Skip | ✅ Actif | DEV |
| `develop` | ✅ Push `:develop` | ✅ Actif | DEV, RCT |
| `main` | ✅ Push `:latest` | ✅ Actif | PPRD, PRD |

## Quality Gate

L'étape 8 utilise `waitForQualityGate abortPipeline: true` : si les seuils
SonarQube ne sont pas respectés, le pipeline est marqué en échec et les
étapes suivantes (Docker build, déploiement) ne sont pas exécutées. Les
seuils sont définis dans l'interface SonarQube :

- Couverture (nouveau code) ≥ 80%
- Duplications (nouveau code) ≤ 3%
- Security / Reliability / Maintainability Rating ≥ A
- Tous les Security Hotspots revus

## Dépannage

### "Cannot connect to Docker daemon"

Vérifier que le conteneur Jenkins a accès au socket Docker :

```bash
docker exec dpscheck_jenkins docker ps
# Doit lister les conteneurs de l'hôte, pas une erreur
```

Si erreur : le volume `/var/run/docker.sock:/var/run/docker.sock` n'est pas monté.
Vérifier `docker-compose.jenkins.yaml`.

### "SonarQube not reachable"

Dans Jenkins, l'URL SonarQube doit être `http://host.docker.internal:9000`
(pas `localhost`, car depuis le conteneur Jenkins, `localhost` = le conteneur lui-même).

### "waitForQualityGate timeout"

Jenkins doit recevoir un webhook de SonarQube pour savoir quand le Quality Gate
est évalué. Configurer dans SonarQube : Administration → Webhooks → Create :
- Name : `jenkins`
- URL : `http://host.docker.internal:8080/sonarqube-webhook/`

### "ansible-playbook: command not found"

L'image Jenkins custom installe Ansible dans le Dockerfile. Vérifier :

```bash
docker exec dpscheck_jenkins ansible --version
```

Si absent, rebuilder l'image :

```bash
docker compose -f docker-compose.jenkins.yaml up -d --build --force-recreate
```

## Couverture rubrique cours (§2.6)

| Exigence | ✅ Couverture |
|---|---|
| Outil CI/CD (Jenkins ou équivalent) | Jenkins LTS + 20+ plugins |
| Étapes automatisées | **14 étapes** alignées sur la figure 2 du rapport |
| Tests automatisés dans la pipeline | Étapes 4, 5, 6 |
| Analyse statique intégrée | Étape 8 avec Quality Gate bloquant |
| Construction image Docker | Étape 9 (Backend + Frontend en parallèle) |
| Scan sécurité | Étape 10 (Trivy) + Étape 11 (SCA) |
| Déploiement automatisé | Étape 14 via Ansible (4 environnements) |
| Gestion multi-environnement | DEV, RCT, PPRD, PRD avec inventaires distincts |
| Choix d'environnement au déploiement | Étape 13 avec input + timeout 2 min → DEV |
