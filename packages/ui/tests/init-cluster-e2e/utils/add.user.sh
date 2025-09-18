#!/bin/bash
set -xe

if [ -z $1 -o -z $2]; then
  (
    echo Usage: $0 username password
  ) >&2
  exit 1
fi

user=$1
password_sha256=$(echo -n $2 | sha256sum | cut -d ' ' -f 1)


yt create user --attr '{name=user}'

export YT_CYPRESS_COOKIE=$(
    curl -v http://localhost:8000/login -H "Authorization: Basic $(echo -n admin:${YT_TOKEN} | base64)" 2>&1 \
        | grep YTCypressCookie \
        | awk -F ":|;" '{print $2}'
)

export X_CSRF_TOKEN=$(curl -H "Cookie: $YT_CYPRESS_COOKIE" http://localhost:8000/auth/whoami | jq -r .csrf_token)

function yt_set_user_password {

    curl -v -X POST \
        -H "Content-Type: application/json" \
        -H "X-Csrf-Token: $X_CSRF_TOKEN" \
        -H "Cookie: $YT_CYPRESS_COOKIE" \
        http://localhost:8000/api/v4/set_user_password --data-raw '{"user": "'$user'", "new_password_sha256": "'$password_sha256'"}'
}

yt_set_user_password "$1" "$2"