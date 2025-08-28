#!/bin/bash
set -xe

# Table with tagged data
TAGGED_TABLE=${E2E_DIR:-/}/tmp/table.truncated.image-audio
yt create --attributes '{schema=[
    {name=image; type_v3={item=string;type_name=tagged;tag="image/jpeg"}};
    {name=audio; type_v3={item=string;type_name=tagged;tag="audio/webm"}};
]}' table ${TAGGED_TABLE}
(
    set +x
    echo -ne "image=$(cat $(dirname $0)/../data/table.truncated.image-audio/image.jpg | base64 -w 0)\t"
    echo -ne "audio=$(cat $(dirname $0)/../data/table.truncated.image-audio/audio.wav | base64 -w 0)\t\n"
    set -x
) | yt write-table --format dsv ${TAGGED_TABLE}
