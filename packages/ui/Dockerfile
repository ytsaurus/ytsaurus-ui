FROM  ghcr.io/gravity-ui/node-nginx:ubuntu22-nodejs20-full.2025-01-24 AS builder

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

FROM  ghcr.io/gravity-ui/node-nginx:ubuntu22-nodejs20-full.2025-01-24

WORKDIR /opt/app

COPY --from=builder /opt/app ./
COPY --from=builder /etc/nginx /etc/nginx
COPY --from=builder /etc/supervisor /etc/supervisor

EXPOSE 80

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
