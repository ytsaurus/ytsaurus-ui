FROM  ghcr.io/gravity-ui/node-nginx:ubuntu22-nodejs20-full AS base

# Update nginx
RUN apt update && apt install -y gnupg2 ca-certificates lsb-release debian-archive-keyring
RUN wget -O - https://nginx.org/keys/nginx_signing.key \
    | gpg --dearmor \
    | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null

RUN echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] https://nginx.org/packages/ubuntu `lsb_release -cs` nginx" \
    | tee /etc/apt/sources.list.d/nginx.list

RUN apt update && apt install -y nginx

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
