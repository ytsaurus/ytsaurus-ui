#!/bin/bash

base=$(readlink -f $(dirname $0)/..)

srcFile="$(readlink -f $base/src/shared)/../../package.json"
dstFile="$base/package.json"

echo Sync source: $srcFile
echo Destination: $dstFile
echo

action=$1

echo $action dependencies...

ts-node scripts/sync-dependencies.ts $action $srcFile $dstFile || (
    echo -e '\nPlease run "npm run deps:sync"'
    false
)
