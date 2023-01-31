#!/bin/sh
set -e

APP_ENV=${APP_ENV:-production}

sed -e "s/%APP_HTTP_PORT%/${APP_HTTP_PORT:-80}/" -i /etc/nginx/sites-enabled/*.conf

if [ "$APP_ENV" = "local" ]; then
    sed -e 's/include \/etc\/nginx\/includes\/yqlkit.conf;//' -i /etc/nginx/sites-enabled/*.conf
    sed -e 's/include \/etc\/nginx\/includes\/docs.conf;//' -i /etc/nginx/sites-enabled/*.conf
fi

if [ -n "$DENY_YQL_PROXY" ]; then
    sed -e 's/include \/etc\/nginx\/includes\/yqlkit.conf;//' -i /etc/nginx/sites-enabled/*.conf
fi

chown -R app /opt/app/secrets
chown app /opt/app/dist/run

supervisorctl start node
supervisorctl start nginx
