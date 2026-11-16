#!/bin/bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 username password" >&2
    exit 1
fi

user=$1
password_sha256=$(printf '%s' "$2" | shasum -a 256 | cut -d ' ' -f 1)

yt create -i user --attributes "{name=\"$user\"}"
yt execute set_user_password "{user=\"$user\";new_password_sha256=\"$password_sha256\"}"
