FROM  ghcr.io/gravity-ui/node-nginx:ubuntu22-nodejs20-full.2025-01-24

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

EXPOSE 80

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
