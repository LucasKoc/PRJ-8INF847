FROM jenkins/jenkins:lts-jdk21

USER root

# ---------- Outils système + clés APT ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      gnupg \
      lsb-release \
      unzip \
      python3 \
      python3-pip \
      python3-venv \
    && rm -rf /var/lib/apt/lists/*

# ---------- Docker CLI (pas le daemon, juste le client) ----------
RUN install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
      > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y --no-install-recommends \
      docker-ce-cli \
      docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# ---------- Sonar Scanner natif (ARM64 compatible) ----------
RUN curl -fsSL \
    https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-linux-aarch64.zip \
    -o /tmp/sonar-scanner.zip && \
    unzip /tmp/sonar-scanner.zip -d /opt && \
    ln -s /opt/sonar-scanner-6.2.1.4610-linux-aarch64/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm /tmp/sonar-scanner.zip && \
    sonar-scanner --version

# ---------- Node.js 20 LTS ----------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    node --version && npm --version

# ---------- Chromium ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      chromium-driver \
    && rm -rf /var/lib/apt/lists/* \
    && chromium --version

# ---------- Ansible ----------
RUN pip3 install --break-system-packages ansible==9.* && \
    ansible --version

# ---------- Donner au user jenkins l'accès au socket Docker ----------
# (Le GID du groupe docker de l'hôte peut varier — bind mount au runtime)
RUN groupadd -f -g 999 docker && usermod -aG docker jenkins

# ---------- Plugins Jenkins pré-installés ----------
USER jenkins
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Retour en root pour exécution (accès docker.sock)
USER root
