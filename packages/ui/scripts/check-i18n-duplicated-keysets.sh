#!/bin/bash

path=$1

tmp=$(mktemp)
trap 'rm -rf "$tmp"' EXIT

echo "Checking for duplicated keysets..." >&2
(
    grep -RE '^export default addI18Keysets\(' "$path" | \
        awk -F ':export default' '{print $2}' | \
        awk -F "," '{print $1}' | \
        sort | uniq -c | grep -vE '^\s+1\s'
) | tee $tmp

if [ -s "$tmp" ]; then
    echo Error: there are some duplicated i18n keyset names, see above >&2
    exit 1
fi