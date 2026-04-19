// ============================================================================
// DPSCHECK — Pipeline CI/CD Jenkins
// ============================================================================
// À placer à la racine du projet (DSPCHECK/Jenkinsfile)
//
// Pipeline en 14 étapes, alignées sur la figure 2 du rapport :
//   1. Checkout            │ 8. Quality (SonarQube)
//   2. Build               │ 9. Docker build
//   3. Validation (lint)   │ 10. Image Security Scan (Trivy)
//   4. Tests unitaires     │
//   5. Tests intégration   │ 12. Docker publish
//   6. Tests fonctionnels  │ 13. Prepare (choix env)
//   7. Cleanup             │ 14. Deployment (Ansible)
//
// Credentials Jenkins à configurer (Manage Jenkins → Credentials) :
//   - sonar-token         : Secret Text (token SonarQube)
//   - dockerhub-creds     : Username with password (Docker Hub)
//   - ansible-ssh-key     : SSH Username with private key (serveurs cibles)
// ============================================================================

pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'SKIP_DEPLOYMENT',
            defaultValue: false,
            description: 'Passer les étapes 13 et 14 (déploiement)'
        )
    }

    environment {
        DOCKER_NAMESPACE = '450666049652775641901333182796'
        IMAGE_BACKEND    = "${DOCKER_NAMESPACE}/dpscheck-backend"
        IMAGE_FRONTEND   = "${DOCKER_NAMESPACE}/dpscheck-frontend"
        IMAGE_TAG        = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
        SONAR_HOST_URL   = 'http://host.docker.internal:9000'
        CHROME_PATH = '/usr/bin/chromium'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    stages {

        // ====================================================================
        // ÉTAPE 1 — Checkout
        // ====================================================================
        stage('Checkout') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  1/14 — Récupération du code source'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                checkout scm
                sh 'git log -1 --pretty=format:"Commit %h par %an%n%s"'
            }
        }

        // ====================================================================
        // ÉTAPE 2 — Build (en parallèle)
        // ====================================================================
        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('Backend') {
                            sh 'npm ci --prefer-offline --no-audit'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('Frontend') {
                            sh 'npm ci --prefer-offline --no-audit'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        // ====================================================================
        // ÉTAPE 3 — Validation (lint en parallèle)
        // ====================================================================
        stage('Validation') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        dir('Backend') {
                            // `|| true` pour ne pas bloquer sur des warnings
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        dir('Frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        // ====================================================================
        // ÉTAPE 4 — Tests unitaires (avec couverture)
        // ====================================================================
        stage('Unit tests') {
            steps {
                dir('Backend') {
                    sh 'npm run test:cov'
                }
            }
            post {
                always {
                    junit(
                        testResults: 'Backend/junit.xml',
                        allowEmptyResults: true
                    )
                    archiveArtifacts(
                        artifacts: 'Backend/coverage/**/*',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
            }
        }

        // ====================================================================
        // ÉTAPE 5 — Tests d'intégration (BDD test isolée sur port 5433)
        // ====================================================================
        stage("Integration tests") {
            steps {
                sh 'docker compose -f docker-compose.integration-test.yaml down -v || true'
                sh 'docker compose -f docker-compose.integration-test.yaml up -d'

                // Attendre que le SCHÉMA soit prêt (pas seulement TCP)
                sh '''
                    for i in $(seq 1 40); do
                        if docker exec dpscheck_postgres_test \
                            psql -U dpscheck_test -d dpscheck_test \
                            -c "SELECT 1 FROM player_profiles LIMIT 1" \
                            > /dev/null 2>&1; then
                            echo "Schéma PostgreSQL prêt"
                            break
                        fi
                        echo "Attente du schéma... ($i/40)"
                        sleep 3
                    done
                '''
                dir('Backend') {
                    withEnv(['DB_HOST=host.docker.internal', 'DB_PORT=5433']) {
                        sh 'npm run test:e2e'
                    }
                }
            }
            post {
                always {
                    sh 'docker compose -f docker-compose.integration-test.yaml down -v || true'
                }
            }
        }

        // ====================================================================
        // ÉTAPE 6 — Tests fonctionnels (Selenium sur stack dédiée port 4201)
        // ====================================================================
        stage('Functionnal tests') {
            steps {
                sh 'docker compose -f docker-compose.selenium.yaml down -v || true'

                sh 'docker compose -f docker-compose.selenium.yaml up -d --build'
                // Attend que le frontend Selenium réponde
                sh '''
                    for i in $(seq 1 40); do
                        if curl -sf http://host.docker.internal:4201 > /dev/null 2>&1; then
                            echo "Stack Selenium prête"
                            break
                        fi
                        echo "Attente stack Selenium... ($i/40)"
                        sleep 3
                    done
                '''

                dir('Selenium') {
                    sh 'npm ci --prefer-offline --no-audit'
                    withEnv([
                        'BASE_URL=http://host.docker.internal:4201',
                        'API_URL=http://host.docker.internal:3001/api',
                        'HEADLESS=true'
                    ]) {
                        sh 'npm test'
                    }
                }
            }
        }

        // ====================================================================
        // ÉTAPE 7 — Cleanup de l'environnement de test
        // ====================================================================
        stage('Cleanup') {
            steps {
                sh '''
                    docker compose -f docker-compose.integration-test.yaml down -v 2>/dev/null || true
                    docker compose -f docker-compose.selenium.yaml down -v 2>/dev/null || true
                    docker container prune -f
                    docker volume prune -f
                '''
            }
        }

        // ====================================================================
        // ÉTAPE 8 — Quality (SonarQube + Quality Gate BLOQUANT)
        // ====================================================================
        stage('Quality (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        dir('Backend') {
                            sh 'npm run test:cov'
                            sh 'sonar-scanner -Dsonar.token=$SONAR_TOKEN -Dsonar.host.url=http://host.docker.internal:9000'
                        }
                        dir('Frontend') {
                            sh 'sonar-scanner -Dsonar.token=$SONAR_TOKEN -Dsonar.host.url=http://host.docker.internal:9000'
                        }
                        dir('Selenium') {
                            sh 'sonar-scanner -Dsonar.token=$SONAR_TOKEN -Dsonar.host.url=http://host.docker.internal:9000'
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        timeout(time: 5, unit: 'MINUTES') {
                            def qg = waitForQualityGate abortPipeline: true
                            if (qg.status != 'OK') {
                                error "Quality Gate échoué : ${qg.status} — Pipeline interrompu"
                            }
                        }
                    }
                }
            }
        }

        // ====================================================================
        // ÉTAPE 9 — Docker build (en parallèle)
        // ====================================================================
        stage('Docker build') {
            parallel {
                stage('Backend image') {
                    steps {
                        sh "docker build -t ${IMAGE_BACKEND}:${IMAGE_TAG} ./Backend"
                        sh "docker tag ${IMAGE_BACKEND}:${IMAGE_TAG} ${IMAGE_BACKEND}:latest"
                    }
                }
                stage('Frontend image') {
                    steps {
                        sh "docker build -t ${IMAGE_FRONTEND}:${IMAGE_TAG} ./Frontend"
                        sh "docker tag ${IMAGE_FRONTEND}:${IMAGE_TAG} ${IMAGE_FRONTEND}:latest"
                    }
                }
                stage('Postgres image') {
                    steps {
                        sh "docker build -t ${DOCKER_NAMESPACE}/dpscheck-postgres:${IMAGE_TAG} -f Backend/sql/Dockerfile ./Backend/sql"
                        sh "docker tag ${DOCKER_NAMESPACE}/dpscheck-postgres:${IMAGE_TAG} ${DOCKER_NAMESPACE}/dpscheck-postgres:latest"
                    }
                }
            }
        }

        // ====================================================================
        // ÉTAPE 10 — Image Security Scan (Trivy)
        // ====================================================================
        stage('Image Security Scan (Trivy)') {
            steps {
                script {
                    ['Backend', 'Frontend'].each { name ->
                        def image = name == 'Backend' ? IMAGE_BACKEND : IMAGE_FRONTEND
                        echo "Trivy scan : ${image}:${IMAGE_TAG}"
                        sh """
                            docker run --rm \\
                                -v /var/run/docker.sock:/var/run/docker.sock \\
                                aquasec/trivy:latest image \\
                                --severity HIGH,CRITICAL \\
                                --ignore-unfixed \\
                                --exit-code 0 \\
                                --format table \\
                                ${image}:${IMAGE_TAG}
                        """
                    }
                }
            }
        }

        // ====================================================================
        // ÉTAPE 12 — Docker publish (uniquement sur branches main/develop)
        // ====================================================================
        stage('Docker publish') {
            when {
                anyOf {
                    expression { env.GIT_BRANCH == 'origin/master' || env.GIT_BRANCH == 'master' }
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${IMAGE_BACKEND}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_NAMESPACE}/dpscheck-postgres:${IMAGE_TAG}"
                }
            }
        }

        // ====================================================================
        // ÉTAPE 13 — Prepare (choix de l'environnement, timeout 2 min)
        // ====================================================================
        stage('Prepare') {
            when {
                not { expression { params.SKIP_DEPLOYMENT } }
            }
            steps {
                script {
                    try {
                        timeout(time: 2, unit: 'MINUTES') {
                            env.TARGET_ENV = input(
                                id: 'deploy-env-input',
                                message: "Environnement de déploiement ?",
                                parameters: [
                                    choice(
                                        name: 'ENV',
                                        choices: ['DEV', 'RCT', 'PPRD', 'PRD'],
                                        description: 'Délai 2 min, sinon DEV par défaut'
                                    )
                                ]
                            )
                        }
                    } catch (err) {
                        env.TARGET_ENV = 'DEV'
                        echo 'Timeout atteint → déploiement sur DEV par défaut'
                    }
                    echo "Environnement cible sélectionné : ${env.TARGET_ENV}"
                }
            }
        }

        // ====================================================================
        // ÉTAPE 14 — Deployment (Ansible)
        // ====================================================================
        stage('Deployment (Ansible)') {
            when {
                not { expression { params.SKIP_DEPLOYMENT } }
            }
            steps {
                script {
                    def targetEnv = (env.TARGET_ENV ?: 'DEV').toLowerCase()
                    echo "Déploiement vers l'environnement ${targetEnv.toUpperCase()}"

                    sh 'pwd && ls -la && ls -la ansible/ 2>&1 || echo "ansible/ introuvable"'

                    if (targetEnv == 'dev') {
                        // Déploiement local (même machine que Jenkins)
                        sh """
                            ansible-playbook \\
                                -i \${WORKSPACE}/ansible/inventories/dev/hosts.yaml \\
                                --connection=local \\
                                --extra-vars 'image_tag=${IMAGE_TAG} target_env=dev' \\
                                \${WORKSPACE}/ansible/deploy.yaml
                        """
                    } else {
                        // Déploiement SSH distant pour RCT / PPRD / PRD
                        withCredentials([sshUserPrivateKey(
                            credentialsId: 'ansible-ssh-key',
                            keyFileVariable: 'SSH_KEY'
                        )]) {
                            sh """
                                ansible-playbook \\
                                    -i \${WORKSPACE}/ansible/inventories/${targetEnv}/hosts.yaml \\
                                    --private-key=\${SSH_KEY} \\
                                    --extra-vars 'image_tag=${IMAGE_TAG} target_env=${targetEnv}' \\
                                    \${WORKSPACE}/ansible/deploy.yaml
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo "  Pipeline réussi — Build ${env.BUILD_NUMBER}"
            echo "  Image tag : ${IMAGE_TAG}"
            echo "  Environnement déployé : ${env.TARGET_ENV ?: 'N/A (skippé)'}"
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        }
        failure {
            echo "Pipeline échoué — Build ${env.BUILD_NUMBER}"
        }
        unstable {
            echo "Pipeline UNSTABLE — tests ou quality gate instables"
        }
        always {
            sh '''
                docker compose -f docker-compose.integration-test.yaml down -v 2>/dev/null || true
                docker compose -f docker-compose.selenium.yaml down -v 2>/dev/null || true
            '''
        }
    }
}
