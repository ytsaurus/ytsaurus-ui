#!/bin/bash

path=$1

function showHelpAndExit {
    echo -e "Usage:" >&2
    echo "    $0 path/to/ytsaurus-ui" >&2
    exit ${1:-1}
}

if [ ! -d $path ]; then
    echo "'$path' is not a directory" >&2
    showHelpAndExit 1
fi

pushd $path >/dev/null

remote=github.com/ytsaurus/ytsaurus-ui.git

if
    (git remote -v | grep -Ev "$(echo $remote | sed 's/\\//./g')") &>/dev/null &&
        test "@ytsaurus/ui" = $(node -e 'console.log(require("./packages/ui/package.json").name)')
then
    (
        echo -e "\nProvided path doesn't look like root of ytsaurus-ui repository."
        echo "It is expected the path has remote like '$remote', but it's missing:"
        git remote -v
        echo -e "\nYou have to clone it and use the path as first argument:"
        echo '    mkdir -p ~/github && cd ~/github && git clone' https://$remote
    ) >&2
    showHelpAndExit 2
fi

popd >/dev/null

base=$(readlink -f $(dirname $0)/..)

function makeLink {
    target=$1
    link=$2

    if [ ! -d $target ]; then
        (
            echo "'$target' is not a directory"
            echo "Please make sure you have provided correct path"
        ) >&2
        showHelpAndExit 3
    fi

    echo $link

    if [ -e "$link" ]; then
        echo -e "\nYou have to remove '$link' to continue:" >&2
        echo "    rm '$link'"

        read -p 'Do you want to remote it? [Yn]: ' y
        if [ "$y" = "" -o "$y" = "Y" -o "$y" = "y" ]; then
            rm "$link"
        else
            exit 3
        fi
    fi

    ln -s "$(readlink -f $target)" "$link"
}

makeLink "$path/packages/ui/src/ui" "$base/src/ytsaurus-ui.ui"
makeLink "$path/packages/ui/src/server" "$base/src/ytsaurus-ui.server"
makeLink "$path/packages/ui/src/shared" "$base/src/shared"
makeLink "$path/packages/ui/src/@types" "$base/src/@types"
