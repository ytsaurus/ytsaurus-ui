FROM ubuntu:20.04

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata && \
    apt-get -y install nano python3-pip nginx curl && \
    pip install supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY deploy/nginx /etc/nginx
COPY deploy/supervisor /etc/supervisor

COPY . .

RUN npm run deps:install

RUN npm run build && \
    npm run deps:truncate && \
    rm -rf /tmp/*

# Make final preparations
RUN useradd -r app && mkdir /var/log/supervisor && rm /etc/nginx/sites-enabled/default

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
