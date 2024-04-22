#!/bin/bash
set +x

base=$(readlink -f $(dirname $0)/..)

function showHelpAndExit {
    echo -e "\nPlease run command:" >&2
    echo "    ./scripts/init-links.sh path/to/ytsaurus-ui" >&2
    exit ${1:-1}
}

parent=''
for i in ytsaurus-ui.ui ytsaurus-ui.server shared '@types'; do
    path="${base}/src/${i}"

    if [ ! -L "$path" ]; then
        echo "Path does not exist or it is not a symbolic link: '${path}'" >&2
        showHelpAndExit 1
    fi

    resolved=$(readlink -f $(readlink -f "${path}")/..)
    if [ -z "${parent}" ]; then
        parent=${resolved}
    else
        if [ "${parent}" != "${resolved}" ]; then
            echo "'src/${i}' link is unsynced with 'src/${prevI}':" >&2
            echo "    ${prevI} -> ${prevResolved}" >&2
            echo "    ${i} -> ${resolved}" >&2
            showHelpAndExit 2
        fi
    fi
    prevI=$i
    prevResolved=$resolved
done
