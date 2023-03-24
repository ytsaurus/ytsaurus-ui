#!/bin/sh
set -e

APP_ENV=${APP_ENV:-production}

sed -e "s/%APP_HTTP_PORT%/${APP_HTTP_PORT:-80}/" -i /etc/nginx/sites-enabled/*.conf

mkdir -p /opt/app/secrets /opt/app/dist/run

chown -R app /opt/app/secrets
chown app /opt/app/dist/run

supervisorctl start node
supervisorctl start nginx
