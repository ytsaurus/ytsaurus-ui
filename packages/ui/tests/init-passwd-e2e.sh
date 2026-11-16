#!/bin/bash
set -euo pipefail

: "${YT_PROXY:?Set YT_PROXY to the local test cluster}"
: "${YT_TOKEN:?Set YT_TOKEN to the local admin token}"

account=account-permission-denied-e2e
path=//sys/accounts/$account

if [ "${1:-}" = "--check" ]; then
    test "$(yt get "$path/@resource_limits/chunk_count")" = 1000
    exit
fi

if [ "$(yt exists //sys/users/user)" = "false" ]; then
    bash "$(dirname "$0")/init-cluster-e2e/utils/add.user.sh" user user
fi

yt create -i account --attributes "{name=$account}"
yt set "$path/@inherit_acl" '%false'
# Absence of a write ACE reproduces the original 'not allowed by any matching ACE' error.
yt set "$path/@acl" '[{action=allow;subjects=[user];permissions=[read;use]}]'
yt set "$path/@resource_limits/chunk_count" 1000
