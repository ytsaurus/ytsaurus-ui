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

yt remove -f //tmp/root
yt remove -f //tmp/locked

yt set //@test_attr "hello_world"

(
    echo -e "555\ttsx"
    echo -e "444\tjs"
    echo -e "333\tts"
) |
    yt write-table \
        --format="<columns=[count;type];enable_type_conversion=%true>schemaful_dsv" \
        "<schema=[{name=count;type=uint64};{name=type;type=string}]>//file-types"

yt copy //file-types //tmp/locked

yt lock --mode snapshot //tmp/locked --tx $(yt start-tx --timeout 3600000)
yt lock --mode shared //tmp/locked --tx $(yt start-tx --timeout 3600000)

yt vanilla --tasks '{main={job_count=1; command="sleep 6000";}}' --spec '{alias="*test-alias"}' --async
