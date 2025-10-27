#!/bin/bash
set -xe

EXPIRATION_TIMEOUT=${EXPIRATION_TIMEOUT:-3600000}

if ! which yt >/dev/null; then
    echo You have to install YT CLI manually, please 1>&2
    exit 1
fi

if [ -z "${YT_PROXY}" ]; then
    echo You have to provide YT_PROXY environment variable 1>&2
    exit 2
fi

function createAndMountDynamicTable {
    path=$1
    schema=$2
    yt create -i --attributes "{dynamic=%true;schema=$schema}" table $path
    yt mount-table $path
}

# userColumnPresets
createAndMountDynamicTable "//tmp/userColumnPresets" "[{name=hash;sort_order=ascending;type=string};{name=columns_json;type=string}]"

suffix=E=$(mktemp -u XXXXXX)
# to lower case
export E2E_SUFFIX=$(mktemp -u XXXXXX | tr '[:upper:]' '[:lower:]')
echo E2E_SUFFIX=$E2E_SUFFIX >./e2e-env.tmp

export E2E_DIR="$(date "+//tmp/e2e.%Y-%m-%d.%H:%M:%S.${E2E_SUFFIX}")"
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

if [ "false" = "$(yt exists //sys/pool_trees/e2e)" ]; then
    yt create scheduler_pool_tree --attributes '{name=e2e;config={nodes_filter=e2e}}'
    e2eNode=$(yt list //sys/cluster_nodes | head -1)
    yt set //sys/cluster_nodes/${e2eNode}/@user_tags/end e2e
    yt set //sys/pool_trees/default/@config/nodes_filter '"!e2e"'

    yt vanilla \
        --tasks '{main2={job_count=10;command="sleep 28800"};}' \
        --spec '{alias="*long-operation";pool_trees=[e2e];scheduling_options_per_pool_tree={e2e={pool=test-e2e}};}' --async
fi

echo -n E2E_OPERATION_ID= >>./e2e-env.tmp
yt vanilla \
    --tasks '{main={"job_count"=10;"command"="sleep 0"}}' --async >>./e2e-env.tmp

echo -n E2E_OPERATION_2_ID= >>./e2e-env.tmp
yt vanilla \
    --tasks '{main2={"job_count"=10;"command"="sleep 0"}}' \
    --spec '{"pool_trees"=[default;e2e];"scheduling_options_per_pool_tree"={"e2e"={pool=test-e2e}}}' --async >>./e2e-env.tmp

if [ "false" = "$(yt exists //sys/pool_trees/default/yt-e2e-pool-1)" ]; then
    yt create --type scheduler_pool --attributes '{name="yt-e2e-pool-1";pool_tree="default";parent_name="<Root>";weight=1}'
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

QUEUE=${E2E_DIR}/queue
createAndMountDynamicTable "$QUEUE" "[{name=value;type=string}]"

DYN_TABLE=${E2E_DIR}/dynamic-table
createAndMountDynamicTable "$DYN_TABLE" "[{name=key;sort_order=ascending;type=string};{name=value;type=string};{name=empty;type=any}]"
(
    set +x
    for ((i = 0; i < 300; i++)); do
        echo "{key=key$i; value=value$i;};"
    done
    set -x
) | yt insert-rows --format yson ${DYN_TABLE}
yt set ${E2E_DIR}/dynamic-table/@mount_config/temp 1
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

PIPELINE=${E2E_DIR}/pipeline
yt create --type pipeline --attributes "{initialize_tables=false}" --path ${PIPELINE}

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

if [ "false" = "$(yt exists //sys/tablet_cell_bundles/e2e-bundle)" ]; then
    yt create tablet_cell_bundle --attributes "{name=e2e-bundle;options=$(yt get //sys/tablet_cell_bundles/default/@options)}"
    yt create tablet_cell --attributes '{tablet_cell_bundle=e2e-bundle}'
fi

TRUNCATED_TABLE=${E2E_DIR}/truncated-table
TRUNCATED_TABLE_SCHEMA=$(cat $(dirname $0)/data/truncated-table/table.schema)
yt create --attributes "$TRUNCATED_TABLE_SCHEMA" table ${TRUNCATED_TABLE}

cat $(dirname $0)/data/truncated-table/data.json | yt write-table --format json ${TRUNCATED_TABLE}

### Specific names

SPECIFIC_NAMES_DIR=${E2E_DIR}/bad-names

yt execute-batch \
    '{command=create;parameters={type=map_node;recursive=true;path="'${SPECIFIC_NAMES_DIR}'/trailing-space /ok"}}' \
    '{command=create;parameters={type=map_node;recursive=true;path="'${SPECIFIC_NAMES_DIR}'/escaped-symbol\x0a/ok"}}' \
    '{command=create;parameters={type=map_node;recursive=true;path="'${SPECIFIC_NAMES_DIR}'/_\x09_\x09/ok"}}' \
    '{command=create;parameters={type=map_node;recursive=true;path="'${SPECIFIC_NAMES_DIR}'/_\x10_\x10/ok"}}' \
    '{command=create;parameters={type=map_node;recursive=true;path="'${SPECIFIC_NAMES_DIR}'/\xc3\x90\xc2\x9a\xc3\x90\xc2\xbe\xc3\x90\xc2\xbc\xc3\x90\xc2\xbf\xc3\x90\xc2\xbe\xc3\x90\xc2\xbd\xc3\x90\xc2\xb5\xc3\x90\xc2\xbd\xc3\x91\xc2\x82\xc3\x91\xc2\x8b \xc3\x90\\xc2\xb4\xc3\\x90\xc2\xbb\xc3\x91\xc2\x8f Paysup.json/ok"}}' \
    '{command=create;parameters={type=map_node;recursive=true;path="'${SPECIFIC_NAMES_DIR}'/Компоненты для Paysup.json/ok"}}' \
    '{command=create;parameters={type=map_node;recursive=true;path="'${E2E_DIR}'/tmp/папка"}}' \
    '{command=create;parameters={type=link;recursive=true;path="'${E2E_DIR}'/tmp/ссылка";attributes={target_path="'${E2E_DIR}'/tmp/папка"}}}' \
    >batch.results.tmp

if grep -i error batch.results.tmp; then
    (
        cat batch.results.tmp
        The last execute-batch has finished with errors
    ) >&2
    exit 1
fi

yt create -r map_node ${SPECIFIC_NAMES_DIR}'/<script>alert('"'"'hello XSS!'"'"')<\/script>/ok'
yt create -r map_node ${SPECIFIC_NAMES_DIR}'/<script>console.error("hello XSS")<\/script>/ok'
yt create -r map_node ${SPECIFIC_NAMES_DIR}'/__\//ok'
yt create -r map_node ${SPECIFIC_NAMES_DIR}'/__\@/ok'
yt create -r map_node ${SPECIFIC_NAMES_DIR}'/__\&/ok'

YQLV3_TABLE=${E2E_DIR}/tmp/yql-v3-types-table
yt create -r --attributes "{schema=[
  {name=bool;type_v3=bool};
  {name=date32;type_v3=date32};
  {name=datetime64;type_v3=datetime64};
  {name=double;type_v3=double};
  {name=int64;type_v3=int64};
  {name=timestamp;type_v3=timestamp64};
  {name=uint64;type_v3=uint64};
  {name=string;type_v3=string};
  {name=json;type_v3=json};
  {name=utf8;type_v3=utf8};
]}" table ${YQLV3_TABLE}
(
    set +x
    for ((i = 1; i < 6; i++)); do
        d=$i$i$i$i$i$i$i$i$i$i$i
        date32=$i$i$i$i
        b=$([ $(expr $i % 2) = "0" ] && echo false || echo true)
        echo '{ "bool":'${b}',
            "date32":'${date32}',
            "datetime64":'${d}',
            "double":'${i}'.'${d}',
            "int64":'${d}',
            "timestamp":'${d}',
            "uint64":'${d}',
            "string": "With\nnew\nlines",
            "json": "{\"foo\":\"bar\"}",
            "utf8": "Некоторый текст"
        }'
    done
    set -x
) | yt write-table --format '<encode_utf8=%false>json' ${YQLV3_TABLE}

CYRILLIC_TRUNCATED_TABLE=${E2E_DIR}/tmp/cyrillic-truncated-table
CYRILLIC_TRUNCATED_TABLE_SCHEMA=$(cat $(dirname $0)/data/cyrillic-truncated-table/table.schema)
yt create --attributes "$CYRILLIC_TRUNCATED_TABLE_SCHEMA" table ${CYRILLIC_TRUNCATED_TABLE}
cat $(dirname $0)/data/cyrillic-truncated-table/data | yt write-table --format yson ${CYRILLIC_TRUNCATED_TABLE}

CYRILLIC_TABLE=${E2E_DIR}/tmp/cyrillic-table
yt create --attributes '{"schema"=[{"name"="Тест1"; "type"="string"};{"name"="Тест2"; "type"="string"}]}' table ${CYRILLIC_TABLE}

if [ "${SKIP_QUERIES}" != "true" ]; then
    # create an operation with problematic symbols
    yt start-query yql 'SELECT count + 1, type || "ã ã" || "this is ÂÅ!" FROM ui.`'${E2E_DIR}'/locked`;' --settings '{"symbols"="ãÂÅỞã";"test_cyr"="Привет";"smyle"="😅"}'
fi

$(dirname $0)/init-cluster-e2e/table.truncated.image-audio.sh
