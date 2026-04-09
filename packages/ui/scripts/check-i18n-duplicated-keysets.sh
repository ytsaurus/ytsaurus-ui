#!/bin/bash

if [ "$1" = "" ]; then
    (
        echo "Usage: "
        echo "    $0 path/to/src"
    ) >&2
    exit 1
fi

extraPath=$1

root=$(dirname $0)/..

tmp=$(mktemp)
trap 'rm -rf "$tmp"' EXIT

(
    grep -RE '^export default addI18Keysets\(' $root/../components/src $extraPath | \
        awk -F ':export default' '{print $2}' | \
        awk -F "," '{print $1}' | \
        sort | uniq -c | grep -vE '^\s+1\s'
) | tee $tmp

if [ -s "$tmp" ]; then
    echo Error: there are some duplicated i18n keyset names, see above >&2
    exit 1
fi