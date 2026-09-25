#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
MEDIA_DIR="$SCRIPT_DIR/../data/table.preview-limit.image-audio.tmp"
SOURCE_DIR="$SCRIPT_DIR/../data/table.truncated.image-audio"
mkdir -p "$MEDIA_DIR"
for mib in 10 20; do
    cp "$SOURCE_DIR/image.jpg" "$MEDIA_DIR/image-$mib-mib.jpg"
    cp "$SOURCE_DIR/audio.wav" "$MEDIA_DIR/audio-$mib-mib.wav"
    # Base64 expands 3 bytes to 4 characters; filenames indicate the encoded cell size.
    # Trailing zero padding preserves the decoded image and audio duration.
    media_size=$((mib * 1024 * 1024 / 4 * 3))
    truncate -s "$media_size" "$MEDIA_DIR/image-$mib-mib.jpg" "$MEDIA_DIR/audio-$mib-mib.wav"
done

TABLE_PATH=${E2E_DIR:-/}/tmp/table.preview-limit.image-audio
yt create --attributes '{schema=[
    {name=image; type_v3={item=string;type_name=tagged;tag="image/jpeg"}};
    {name=audio; type_v3={item=string;type_name=tagged;tag="audio/webm"}};
    {name=sizes; type=string};
]}' table "$TABLE_PATH"
# Stream base64 directly to JSON: large values should not become shell arguments.
{
    for mib in 10 20; do
        printf '{"image":"'
        base64 -w 0 "$MEDIA_DIR/image-$mib-mib.jpg"
        printf '","audio":"'
        base64 -w 0 "$MEDIA_DIR/audio-$mib-mib.wav"
        printf '","sizes":"image: %s MiB; audio: %s MiB"}\n' "$mib" "$mib"
    done
} | yt write-table --format json --table-writer '{max_row_weight=67108864;}' "$TABLE_PATH"
