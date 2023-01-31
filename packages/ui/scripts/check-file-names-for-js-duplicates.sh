#!/bin/bash

## The command fails if there are some "*.js" duplicates for any existing ts/tsx file.
# For example, it should fail if there are files:
#     src/ui/pages/navigation/CopyToRemote/CopyToRemote.tsx
#     src/ui/pages/navigation/CopyToRemote/CopyToRemote.js

echo -n Checking file names for '*.js'  duplicates...

function dieIfDuplicates {
    tmp=`mktemp`
    find src -name "*.ts*" | sed -e 's/\.ts$/.js/g' -e 's/\.tsx$/.js/g' | xargs -I {} bash -c "test -f {} && echo {}" > $tmp
    count=`cat $tmp | wc -l`
    if [ $count -ne 0 ]; then
        echo
        cat $tmp
        echo
        rm $tmp
        false
    else
        rm $tmp
    fi
}

if dieIfDuplicates ; then
  echo OK
else
  echo ERROR: You have to get rid of all the duplicates
  echo
  false
fi