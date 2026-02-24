export function getDefaultRequestOutputFormat({
    stringLimit,
    tableColumnLimit = undefined,
    columnNamesLimit = undefined,
    useYqlTypes,
}: {
    stringLimit: number | undefined;
    tableColumnLimit: number | undefined;
    columnNamesLimit: number | undefined;
    useYqlTypes: boolean | undefined;
}) {
    return {
        /** @type {'web_json'} */
        $value: 'web_json' as const,
        $attributes: {
            field_weight_limit: stringLimit,
            string_weight_limit: stringLimit ? Math.round(stringLimit / 10) : undefined,
            max_selected_column_count: tableColumnLimit,
            max_all_column_names_count: columnNamesLimit,
            /** @type {'yql' | undefined} */
            value_format: useYqlTypes ? ('yql' as const) : undefined,
        },
    };
}
