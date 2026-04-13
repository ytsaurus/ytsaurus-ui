import reverse_ from 'lodash/reverse';

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
