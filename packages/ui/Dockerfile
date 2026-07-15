ARG UBUNTU_VERSION=22.04

FROM ubuntu:${UBUNTU_VERSION} AS base

ARG NODE_MAJOR=20
ARG DEBIAN_FRONTEND=noninteractive

ENV TZ="Etc/UTC"

# Packages installation
RUN <<EOT
set -e

apt-get update
apt-get -y upgrade

# Install tooling
apt-get -y install curl gnupg lsb-release

# Install CA certificates
apt-get -y install ca-certificates

# Set NodeJS repository
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

# Set Nginx repository
curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor -o /usr/share/keyrings/nginx-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] https://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" | tee /etc/apt/sources.list.d/nginx.list

# Install packages
apt-get update
apt-get -y install nodejs nginx supervisor tzdata

# Remove unnecessary packages
apt-get -y purge gnupg lsb-release
apt-get -y autoremove
apt-get clean

# Clean
rm -rf /etc/nginx/sites-available/default /var/lib/apt/lists/*
rm -r /etc/apt/sources.list.d/nodesource.list /etc/apt/keyrings/nodesource.gpg
EOT

# Timezone setting
RUN <<EOT
set -e

ln -sf /usr/share/zoneinfo/$TZ /etc/localtime
echo $TZ > /etc/timezone
EOT

# Users setting
RUN <<EOT
set -e

useradd -r app
mkdir /opt/app
chown app:app /opt/app
EOT

FROM base AS builder

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY scripts ./scripts
COPY deploy ./deploy
COPY deploy/nginx /etc/nginx
COPY deploy/supervisor /etc/supervisor
COPY package.json package-lock.json ./
RUN npm run deps:install

COPY . .
RUN npm run build && npm run deps:truncate

FROM base

WORKDIR /opt/app

COPY --from=builder /opt/app ./
COPY --from=builder /etc/nginx /etc/nginx
COPY --from=builder /etc/supervisor /etc/supervisor

EXPOSE 80

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
