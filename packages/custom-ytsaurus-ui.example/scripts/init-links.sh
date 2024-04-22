#!/bin/bash

path=$1

function showHelpAndExit {
    echo -e "Usage:" >&2
    echo "    $0 path/to/ytsaurus-ui" >&2
    exit ${1:-1}
}

if [ ! -d $path ]; then
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

for i in ytsaurus-ui.ui ytsaurus-ui.server shared '@types'; do
    if [ -e $base/src/$i ]; then
        echo -e "\nYou have to remove 'src/$i' to continue:" >&2
        echo "    rm $base/src/$i"

        read -p 'Do you want to remote it? [Yn]: ' y
        if [ "$y" = "" -o "$y" = "Y" -o "$y" = "y" ]; then
            rm "$base/src/$i"
        else
            exit 3
        fi
    fi
done

ln -s $path/packages/ui/src/ui $base/src/ytsaurus-ui.ui
ln -s $path/packages/ui/src/server $base/src/ytsaurus-ui.server
ln -s $path/packages/ui/src/shared $base/src/shared
ln -s $path/packages/ui/src/@types $base/src/@types
