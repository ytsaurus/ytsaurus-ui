#!/bin/bash

EXPIRATION_TIMEOUT=${EXPIRATION_TIMEOUT:-3600000}

set -xe

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
    echo E2E_DIR=${E2E_DIR} >./e2e-env.tmp
fi

yt create map_node ${E2E_DIR}
yt set ${E2E_DIR}/@expiration_timeout 10000

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

yt lock --mode snapshot ${E2E_DIR}/locked --tx $(yt start-tx --timeout ${EXPIRATION_TIMEOUT})
yt lock --mode shared ${E2E_DIR}/locked --tx $(yt start-tx --timeout ${EXPIRATION_TIMEOUT})

yt create -i -r map_node  "${E2E_DIR}/bad-names/trailing-space /ok"
yt create -i -r map_node  "${E2E_DIR}/bad-names/escaped-symbol\\x0a/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/<script>alert('hello XSS!')<\\/script>/ok"
yt create -i -r  map_node "${E2E_DIR}/bad-names/<script>console.error(\"hello XSS\")<\\/script>/ok"
yt create -i -r  map_node "${E2E_DIR}/bad-names/_\\x09_\\x09/ok"
yt create -i -r  map_node "${E2E_DIR}/bad-names/_\\x10_\\x10/ok"
yt create -i -r  map_node "${E2E_DIR}/bad-names/\\xc3\\x90\\xc2\\x9a\\xc3\\x90\\xc2\\xbe\\xc3\\x90\\xc2\\xbc\\xc3\\x90\\xc2\\xbf\\xc3\\x90\\xc2\\xbe\\xc3\\x90\\xc2\\xbd\\xc3\\x90\\xc2\\xb5\\xc3\\x90\\xc2\\xbd\\xc3\\x91\\xc2\\x82\\xc3\\x91\\xc2\\x8b \\xc3\\x90\\xc2\\xb4\\xc3\\x90\\xc2\\xbb\\xc3\\x91\\xc2\\x8f Paysup.json/ok"
yt create -i -r  map_node "${E2E_DIR}/bad-names/__\\//ok"
yt create -i -r  map_node "${E2E_DIR}/bad-names/__\\@/ok"

if [ "false" = "$(yt exists //sys/pool_trees/e2e)" ]; then
    yt create scheduler_pool_tree --attributes '{name=e2e;config={nodes_filter=e2e}}'
fi

echo -n E2E_OPERATION_ID= >>./e2e-env.tmp
yt vanilla \
    --tasks '{main={"job_count"=10;"command"="sleep 0"}}' --async >>./e2e-env.tmp

echo -n E2E_OPERATION_2_ID= >>./e2e-env.tmp
yt vanilla \
    --tasks '{main2={"job_count"=10;"command"="sleep 0"}}' \
    --spec '{"pool_trees"=[default;e2e];"scheduling_options_per_pool_tree"={"e2e"={pool=test-e2e}}}' --async >>./e2e-env.tmp

if [ "false" = "$(yt exists //sys/pool_trees/default/yt-e2e-pool-1)" ]; then
    yt create --type scheduler_pool --attributes '{name="yt-e2e-pool-1";pool_tree="default";parent_name="<Root>"}'
fi

if [ "false" = "$(yt exists //sys/pool_trees/default/yt-e2e-pool-2)" ]; then
    yt create --type scheduler_pool --attributes '{name="yt-e2e-pool-2";pool_tree="default";parent_name="<Root>"}'
fi

if [ "false" = "$(yt exists //sys/pool_trees/default/yt-e2e-weight-null)" ]; then
    yt create --type scheduler_pool --attributes '{name="yt-e2e-weight-null";weight=#;pool_tree="default";parent_name="<Root>"}'
fi

if [ "false" = "$(yt exists //sys/accounts/account-for-e2e)" ]; then
    yt create --type account --attributes '{name="account-for-e2e"}'
fi

DYN_TABLE=${E2E_DIR}/dynamic-table
yt create --attributes "{dynamic=%true;schema=[{name=key;sort_order=ascending;type=string};{name=value;type=string};{name=empty;type=any}]}" table ${DYN_TABLE}
yt mount-table ${DYN_TABLE}
(
    set +x
    for ((i = 0; i < 300; i++)); do
        echo "{key=key$i; value=value$i;};"
    done
    set -x
) | yt insert-rows --format yson ${DYN_TABLE}

STATIC_TABLE=${E2E_DIR}/static-table
yt create --attributes "{schema=[{name=key;type=string};{name=value;type=string};{name=empty;type=any}]}" table ${STATIC_TABLE}
(
    set +x
    for ((i = 0; i < 300; i++)); do
        echo '{"key": "key'$i'", "value": "value'$i'"}'
    done
    set -x
) | yt write-table --format json ${STATIC_TABLE}
