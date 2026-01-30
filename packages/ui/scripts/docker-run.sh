#!/usr/bin/env bash

set -euo pipefail

# Version of installed @playwright/test
VERSION=$(node -e 'console.log(require("./package-lock.json").packages["node_modules/@playwright/test"].version)')

if [[ "${VERSION}" = "" ]]; then
    (
        echo -e "Error: cannot determine version of installed @playwright/test"
        echo -e "  You have to install @playwright/test as used by the docker image"
        echo -e "    Corresponding docker image will be used to run tests"
    ) >&1
    exit 1
else
    echo -e "Found @playwright/test: v${VERSION}\n"
fi

IMAGE_NAME="mcr.microsoft.com/playwright"
IMAGE_TAG="v"${VERSION}"-noble"
PW_VERSION=$(echo $IMAGE_TAG | awk -F "-" '{print $1}' | sed -e 's/^v//')

NAME=$(node -e 'console.log(require("./package.json").name)')
NODE_MODULES_CACHE_DIR="$HOME/.cache/$(dirname $(readlink -f ./package.json) | sed -E s/[^a-zA-Z0-9.-]/_/g)"

echo Using cache directory: ${NODE_MODULES_CACHE_DIR}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if command_exists docker; then
    CONTAINER_TOOL="docker"
elif command_exists podman; then
    CONTAINER_TOOL="podman"
else
    echo "Neither Docker nor Podman is installed on the system."
    exit 1
fi

run_command() {
    toRun="$@"

    if [ "${toRun}" = "" ]; then
        echo 'Nothing to run, the command is empty' >&2
        exit 2
    else
        echo toRun: $toRun
    fi

    envFile=${0}.env
    echo
    if [ -f "$envFile" ]; then
        useEnvFile="--env-file $envFile"
        echo Env file is found:
        echo "    $useEnvFile"
    else
        useEnvFile=
        echo "Use the file to provide environment variables:"
        echo "    $envFile"
        envFile=$(mktemp)
        trap "rm -f $envFile" EXIT

        env | grep -P "$(cat $(dirname $0)/../tests/env.names.txt | tr '\n' '|')" > $envFile || true
        useEnvFile="--env-file $envFile"
    fi

    $CONTAINER_TOOL run --name ytsaurus-ui.tests \
        --rm \
        --network host \
        -e PW_OPTIONS="${PW_OPTIONS:- }" \
        -e DOCKER_CI=1 \
        -w /work \
        -v $(pwd):/work \
        -v "$NODE_MODULES_CACHE_DIR/node_modules:/work/node_modules" \
        -v "$NODE_MODULES_CACHE_DIR/.cache-playwright:/work/.cache-playwright" \
        $useEnvFile \
        "$IMAGE_NAME:$IMAGE_TAG" \
        /bin/bash -c "umask 0000; $toRun"
}

action=${1:-test}

if [ "$action" = "clear-cache" ]; then
    rm -rf "$NODE_MODULES_CACHE_DIR"
    exit 0
fi

checksumFile="${NODE_MODULES_CACHE_DIR}/package-lock.json.shasum"

if
    ! shasum -c "${checksumFile}" ||
        ! test -d "${NODE_MODULES_CACHE_DIR}"
then
    mkdir -p "$NODE_MODULES_CACHE_DIR/node_modules"
    mkdir -p "$NODE_MODULES_CACHE_DIR/.cache-playwright"

    run_command 'npm ci'
    shasum ./package-lock.json >"${checksumFile}"
fi

run_command $@