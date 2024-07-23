#!/bin/bash

path=$1

function check {
    if grep -Hrn '^import .*from.*lodash/.*;$' "$path" | grep -vP ":import (?<fn>\\w+)_ from 'lodash/\\k<fn>';$"; then
        (
            echo
            echo "Error: Please make sure names of imorted modules from lodash corresponds to its name with underline at the end!"
            echo "  Examples:"
            echo "    import map_ from 'lodash/map';"
            echo "    import reduce_ from 'lodash/reduce'"
            echo "    import indexOf_ from 'lodash/indexOf';"
        ) >&2
        return 1
    fi
}

check
