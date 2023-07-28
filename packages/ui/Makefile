.PHONY: dev
dev:
	sudo nginx -s stop || true
	sudo nginx
	@export YT_AUTH_CLUSTER_ID=meta; \
	export YT_AUTH_ALLOW_INSECURE=1; \
	export YTAUTH_URL=http://auth.auth-yt.clouds.idzn.ru:80; \
	npm run dev