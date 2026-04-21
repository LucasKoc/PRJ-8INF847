# PRJ-8INF847

## Environment setup

### Requirements

Required :
- Node (pref. v24 LTS)
- Docker

## Tests

### Unit tests

```bash
cd Backend
npm run test
cd ..
```

### Integration tests

```bash
docker compose -f docker-compose.integration-test.yaml up -d
cd Backend
npm run test:e2e
cd .. && docker compose -f docker-compose.integration-test.yaml down -v
```

## Functionnal tests (Selenium)

```bash
docker compose -f docker-compose.selenium.yaml up -d --build
cd Selenium && npm test
cd .. && docker compose -f docker-compose.selenium.yaml down -v
```

## SonarQube 

### SonarQube Docker Compose

```bash
docker compose -f docker-compose.sonarqube.yaml up -d

# http://localhost:9000 -> admin/admin -> change password -> generate token
export SONAR_TOKEN=sqa_9750aa2022808896910dc7a0e53f48711e1187d0

# Analyze SonarQube
./SonarQube/run-sonar-all.sh

# docker compose -f docker-compose.sonarqube.yaml down
```

## Jenkins

```bash
docker compose -f docker-compose.jenkins.yaml up -d --build

# http://localhost:8080 -> Get admin password -> Install suggested plugins -> Create first admin user
# Token from SonarQube is needed for SonarQube plugin configuration in Jenkins
# Webhook on SonarQube side to setup
# Create job in Jenkins with pipeline script from Jenkinsfile
# Point to GitHub repo - https://github.com/LucasKoc/PRJ-8INF847  
# Launch job

# docker compose -f docker-compose.jenkins.yaml down
```