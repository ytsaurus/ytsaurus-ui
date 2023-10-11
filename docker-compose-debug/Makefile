.PHONY: build
build:
	cd ../packages/ui/ && npm_config_dockertag=debug npm run docker:build:dev

.PHONY: run
run: build
	docker compose up
