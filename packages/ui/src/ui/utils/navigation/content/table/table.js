import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import reverse_ from 'lodash/reverse';

import Columns from '../../../../utils/navigation/content/table/columns';

export function parseErrorFromResponse(data) {
    // TODO use JSON.parse when error format is fixed
    // TODO move to yt-javascript module as utility
    const ERROR_DELIMETER =
        '\n' +
        '================================================================================' +
        '\n';
    const startDelimeterIndex = data.indexOf(ERROR_DELIMETER);
    const endDelimeterIndex = data.lastIndexOf(ERROR_DELIMETER);

    if (
        startDelimeterIndex !== -1 && // There is a start delimeter
        endDelimeterIndex !== -1 && // There is an end delimeter
        startDelimeterIndex !== endDelimeterIndex && // It is not the same delimeter
        endDelimeterIndex + ERROR_DELIMETER.length === data.length // End delimeter ends response
    ) {
        return data.substring(startDelimeterIndex + ERROR_DELIMETER.length, endDelimeterIndex);
    }
}

export function prepareRows(rowData, reverseRows = false) {
    const data = JSON.parse(rowData);
    const rows = reverseRows ? reverse_(data.rows) : data.rows;
    return {
        rows: rows,
        columns: data.all_column_names,
        yqlTypes: data.yql_type_registry || null,
    };
}

export function getColumnsValues(row, keyColumns) {
    return (
        row && map_(keyColumns, (keyColumnName) => row[Columns.escapeSpecialColumn(keyColumnName)])
    );
}

export function prepareHeaders(headers) {
    const responseParameters = headers['x-yt-response-parameters'];

    if (responseParameters) {
        try {
            const params = JSON.parse(responseParameters);

            return params['omitted_inaccessible_columns'] || [];
        } catch (err) {
            return [];
        }
    }

    return [];
}

export function getRequestOutputFormat(
    columns,
    stringLimit,
    login,
    defaultTableColumnLimit,
    useYqlTypes,
) {
    const filteredColumns = filter_(columns, (column) => column.checked || column.keyColumn);
    const columnNames = map_(filteredColumns, (column) => column.name);
    const outputFormat = getDefaultRequestOutputFormat({
        stringLimit,
        defaultTableColumnLimit,
        columnNamesLimit: 3000,
    });
    if (useYqlTypes) {
        outputFormat.$attributes.value_format = 'yql';
    }
    if (columnNames.length) {
        outputFormat.$attributes.column_names = columnNames;
    }
    return outputFormat;
}

export function getDefaultRequestOutputFormat({
    stringLimit,
    tableColumnLimit = undefined,
    columnNamesLimit = undefined,
}) {
    return {
        $value: 'web_json',
        $attributes: {
            field_weight_limit: stringLimit,
            string_weight_limit: stringLimit ? Math.round(stringLimit / 10) : undefined,
            max_selected_column_count: tableColumnLimit,
            max_all_column_names_count: columnNamesLimit,
        },
    };
}

export function getParsedError(error) {
    let message;
    try {
        message = JSON.parse(error).message;
    } catch (err) {
        message = 'Table reader returned an error';
    }

    return {
        message,
        attributes: {
            stderrs: error,
        },
    };
}
