FROM  ghcr.io/gravity-ui/node-nginx:ubuntu20-nodejs18

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY deploy ./deploy
COPY deploy/nginx /etc/nginx
COPY deploy/supervisor /etc/supervisor

COPY ./ytsaurus-ui-*.tgz ./

ARG UI_VERSION
ARG DEV

RUN UI_PACKAGE=$(test -n "${DEV}" && echo ./ytsaurus-ui-${UI_VERSION}.tgz || echo ytsaurus-ui-${UI_VERSION}.tgz) \
        && echo "\n  UI_VERSION=${UI_VERSION} \n  DEV=${DEV} \n  UI_PACKAGE=${UI_PACKAGE} \n" >&2 \
        && npm install --legacy-peer-deps $UI_PACKAGE \
        && mv node_modules/@ytsaurus/ui . && mv ui/* .

EXPOSE 80

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
