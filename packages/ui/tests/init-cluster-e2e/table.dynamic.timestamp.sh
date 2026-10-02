#!/bin/bash
set -euo pipefail

TABLE_PATH="${E2E_DIR:?E2E_DIR must be set}/dynamic-timestamp-table"
yt create --attributes '{dynamic=%true;schema=[
    {name=timestamp;type_v3=timestamp;sort_order=ascending};
    {name=value;type_v3=int64};
]}' table "$TABLE_PATH"
yt mount-table --sync "$TABLE_PATH"

# Adjacent keys differ by one microsecond, so rounding skips or repeats rows.
{
    for ((i = 0; i < 30; i++)); do
        printf '{timestamp=%su;value=%s;};\n' "$((1704067200123456 + i))" "$i"
    done
} | yt insert-rows --format yson "$TABLE_PATH"
