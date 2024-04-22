#!/bin/bash

$(dirname $0)/check-links.sh

clusterConfig=./clusters-config.json
secretsJson=./secrets/yt-interface-secret.json

if [ "$APP_ENV" != "local" ]; then
  if [ ! -f ${clusterConfig} ]; then
    echo "You have to provide '${clusterConfig}' file before start"
    echo "see ${clusterConfig}.example"
    echo
    exit 1
  fi

  if [ ! -f ${secretsJson} ]; then
    echo "You have to provide '${secretsJson}' file before start"
    echo "see ${secretsJson}.example"
    echo
    exit 1
  fi
fi
