#!/bin/bash

base=$(readlink -f $(dirname $0)/..)

target_file="$base/src/ui/components/Icon/icons-table.md"
import_file="$base/src/ui/components/Icon/auto-imported-icons.ts"
input_dir="$base/src/ui/assets/img/svg/icons/"

buf_file=$(mktemp)

# Clear the existing file
>$target_file

>$buf_file

(
    echo "/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */"
    echo "/* !!!! DO NOT EDIT THE FILE MANUALLY !!! */"
    echo "/* !!!!!!!!! AUTO GENERATED FILE !!!!!!!! */"
    echo "/* !!!!!! USE: npm run update:icons !!!!! */"
    echo "/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */"
) >$import_file

printf "|Name|Custom Icons|@gravity-ui/icons|preview|  \n" >>$target_file
printf "|-|-|-|-|  \n" >>$target_file

printf "export const autoIcons = {\n" >>$buf_file

# Run function with import argument
for svg_file_name in $(ls $input_dir); do
    icon_name=${svg_file_name%.*}
    res=$(find node_modules/@gravity-ui/icons/ -name "$icon_name.svg" -type f -printf "%f\n")
    echo $res
    printf "|$icon_name|<img src='../../assets/img/svg/icons/$icon_name.svg'>|$res|" >>$target_file

    camel_icon_name=$(echo "$icon_name" | sed -r "s/(^|-)([a-z0-9])/\U\2/g")
    printf "import $camel_icon_name from '../../assets/img/svg/icons/$icon_name.svg';\n" >>$import_file
    printf "    ['$icon_name']: $camel_icon_name,\n" >>$buf_file
    if [[ $res != '' ]]; then
        printf "<img src='../../../../node_modules/@gravity-ui/icons/svgs/$icon_name.svg'>|  \n" >>$target_file
    else
        printf " |  \n" >>$target_file
    fi
done
printf "};\n" >>$buf_file
cat $buf_file >>$import_file
rm $buf_file
