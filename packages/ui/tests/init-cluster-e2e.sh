#!/bin/bash

set -x

if ! which yt >/dev/null; then
    echo You have to install YT CLI manually, please 1>&2
    exit 1
fi

if [ -z "${YT_PROXY}" ]; then
    echo You have to provide YT_PROXY environment variable 1>&2
    exit 2
fi

if [ -z "${E2E_DIR}" ]; then
    E2E_DIR="$(mktemp -u $(date "+//tmp/e2e.%Y-%m-%d.%H:%M:%S.XXXXXXXX"))"
fi

echo ${E2E_DIR} >./e2e-dir.tmp

yt create map_node ${E2E_DIR}

yt remove -f ${E2E_DIR}/root
yt remove -f ${E2E_DIR}/locked

yt set //@test_attr "hello_world"

(
    echo -e "555\ttsx"
    echo -e "444\tjs"
    echo -e "333\tts"
) |
    yt write-table \
        --format="<columns=[count;type];enable_type_conversion=%true>schemaful_dsv" \
        "<schema=[{name=count;type=uint64};{name=type;type=string}]>${E2E_DIR}/file-types"

yt copy ${E2E_DIR}/file-types ${E2E_DIR}/locked

yt lock --mode snapshot ${E2E_DIR}/locked --tx $(yt start-tx --timeout 3600000)
yt lock --mode shared ${E2E_DIR}/locked --tx $(yt start-tx --timeout 3600000)

yt vanilla --tasks '{main={job_count=1; command="sleep 6000";}}' --spec '{alias="*test-alias"}' --async

if [ "false" = "$(yt exists //sys/pool_trees/default/yt-e2e-pool-1)" ]; then
    yt create --type scheduler_pool --attributes '{name="yt-e2e-pool-1";pool_tree="default";parent_name="<Root>"}'
fi

if [ "false" = "$(yt exists //sys/pool_trees/default/yt-e2e-pool-2)" ]; then
    yt create --type scheduler_pool --attributes '{name="yt-e2e-pool-2";pool_tree="default";parent_name="<Root>"}'
fi
