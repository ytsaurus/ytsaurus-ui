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
