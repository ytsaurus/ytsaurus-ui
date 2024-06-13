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

suffix=E=$(mktemp -u XXXXXX)
# to lower case
E2E_SUFFIX=$(mktemp -u XXXXXX | tr '[:upper:]' '[:lower:]')
echo E2E_SUFFIX=$E2E_SUFFIX >./e2e-env.tmp

E2E_DIR="$(date "+//tmp/e2e.%Y-%m-%d.%H:%M:%S.${E2E_SUFFIX}")"
echo E2E_DIR=${E2E_DIR} >>./e2e-env.tmp

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

yt create -i -r map_node "${E2E_DIR}/bad-names/trailing-space /ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/escaped-symbol\\x0a/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/<script>alert('hello XSS!')<\\/script>/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/<script>console.error(\"hello XSS\")<\\/script>/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/_\\x09_\\x09/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/_\\x10_\\x10/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/\\xc3\\x90\\xc2\\x9a\\xc3\\x90\\xc2\\xbe\\xc3\\x90\\xc2\\xbc\\xc3\\x90\\xc2\\xbf\\xc3\\x90\\xc2\\xbe\\xc3\\x90\\xc2\\xbd\\xc3\\x90\\xc2\\xb5\\xc3\\x90\\xc2\\xbd\\xc3\\x91\\xc2\\x82\\xc3\\x91\\xc2\\x8b \\xc3\\x90\\xc2\\xb4\\xc3\\x90\\xc2\\xbb\\xc3\\x91\\xc2\\x8f Paysup.json/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/Компоненты для Paysup.json/ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/__\\//ok"
yt create -i -r map_node "${E2E_DIR}/bad-names/__\\@/ok"

if [ "false" = "$(yt exists //sys/pool_trees/e2e)" ]; then
    yt create scheduler_pool_tree --attributes '{name=e2e;config={nodes_filter=e2e}}'
    e2eNode=$(yt list //sys/cluster_nodes | head -1)
    yt set //sys/cluster_nodes/${e2eNode}/@user_tags/end e2e
    yt set //sys/pool_trees/default/@config/nodes_filter '"!e2e"'

    yt vanilla \
        --tasks '{main2={"job_count"=10;"command"="sleep 7200"}}' \
        --spec '{"pool_trees"=[e2e];"scheduling_options_per_pool_tree"={"e2e"={pool=test-e2e}}}' --async
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

function createAccountByPath {
    path=$1
    nodeCount=$2
    if [ "true" = "$(yt exists ${path})" ]; then
        return
    fi

    accounts=$(echo ${path} | sed 's/^\/\/sys\/accounts\///g')
    name=$(echo ${accounts} | sed 's/\//\n/g' | tail -1)
    parent=$(echo ${accounts} | sed 's/\//\n/g' | tail -2 | head -1)

    if [ "$parent" != "$name" ]; then
        yt create --type account --attributes '{name="'$name'";parent_name="'$parent'"}'
    else
        yt create --type account --attributes '{name="'$name'"}'
    fi

    if [ "$nodeCount" != "" ]; then
        yt set $path/@resource_limits/node_count $nodeCount
    fi
}

createAccountByPath //sys/accounts/account-for-e2e

function createAccountNodes {
    account=$1-${E2E_SUFFIX}

    yt create -i -r map_node ${E2E_DIR}/${1} --attributes '{account='$account'}'
    yt create -i -r map_node ${E2E_DIR}/${1}/child-1/0 --attributes '{account='$account'-child-1}'
    yt create -i -r map_node ${E2E_DIR}/${1}/child-2/0/1 --attributes '{account='$account'-child-2}'
}

function createAccountForQuotaEditor {
    account=${1}-${E2E_SUFFIX}
    createAccountByPath //sys/accounts/${account} 10
    createAccountByPath //sys/accounts/${account}/${account}-child-1 5
    createAccountByPath //sys/accounts/${account}/${account}-child-2 5
    createAccountNodes ${1}
}

createAccountForQuotaEditor e2e-parent
createAccountForQuotaEditor e2e-overcommit
yt set //sys/accounts/e2e-overcommit-${E2E_SUFFIX}/@allow_children_limit_overcommit %true

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
yt freeze-table ${DYN_TABLE}

STATIC_TABLE=${E2E_DIR}/static-table
yt create --attributes "{schema=[{name=key;type=string};{name=value;type=string};{name=empty;type=any}]}" table ${STATIC_TABLE}
(
    set +x
    for ((i = 0; i < 300; i++)); do
        echo '{"key": "key'$i'", "value": "value'$i'"}'
    done
    set -x
) | yt write-table --format json ${STATIC_TABLE}

# Table with tagged data
TAGGED_TABLE=${E2E_DIR}/tagged-table
yt create --attributes '{schema=[
    {name=svgxml;  type_v3={item=string;type_name=tagged;tag="image/svg+xml"}};
    {name=imageurl;type_v3={item=string;type_name=tagged;tag=imageurl}};
    {name=imageurl_as_text;type_v3={item=string;type_name=tagged;tag=imageurl}};
]}' table ${TAGGED_TABLE}
(
    echo -ne "svgxml=$(cat $(dirname $0)/../src/ui/assets/img/svg/calendar.svg | base64 -w 0)\t"
    echo -ne "imageurl=https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-big.44e3fa56.jpg\t"
    echo -e "imageurl_as_text=https://deny-yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-big.44e3fa56.jpg\t"
) | yt write-table --format dsv ${TAGGED_TABLE}

yt create -i access_control_object_namespace --attr '{name=queries}'
yt create -i access_control_object --attr '{namespace=queries;name=nobody}'

yt set ${E2E_DIR}/@acl '[
    {action=allow;subjects=[admins;];permissions=[write;administer;remove;mount;];inheritance_mode=object_and_descendants;};
    {action=allow;subjects=[users;];permissions=[read;];inheritance_mode=object_and_descendants;};
    {action=allow;subjects=[users;];permissions=[read;write;remove];inheritance_mode=object_and_descendants;};
]'

yt set ${E2E_DIR}/@inherit_acl %false
