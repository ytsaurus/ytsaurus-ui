#!/bin/bash
set -ex

if ! which yt >/dev/null; then
    echo You have to install YT CLI manually, please 1>&2
    exit 1
fi

if [ -z "${YT_PROXY}" ]; then
    echo You have to provide YT_PROXY environment variable 1>&2
    exit 2
fi

# Import known dashboards
pushd $(dirname $0)/data/monitoring/json
ls | xargs -I {} bash -c "
    echo -n Creating document {}...;
    yt create -r -i document //sys/interface-monitoring/{} >/dev/null && \
    yt set --format json //sys/interface-monitoring/{} < {} && \
    echo OK;
"

yt create -r -i table //tmp/queue --attributes '{dynamic=true;schema=[{name=data;type=string};{name="$timestamp";type=uint64};{name="$cumulative_data_weight";type=int64}]}'
yt create -i queue_consumer //tmp/consumer
yt register-queue-consumer //tmp/queue //tmp/consumer --vital
yt mount-table --sync //tmp/queue
yt mount-table --sync //tmp/consumer

(
    set +x
    for ((i = 0; i < 300; i++)); do
        echo "{data=data_$i_$i;};"
    done
    set -x
) | yt insert-rows --format yson //tmp/queue
