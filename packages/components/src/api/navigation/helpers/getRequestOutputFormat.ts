import map_ from 'lodash/map';
import filter_ from 'lodash/filter';
import {getDefaultRequestOutputFormat} from './getDefaultRequestOutputFormat';
import {ReadTableOutputFormat} from '../../../types/yt-types';

export const getRequestOutputFormat = ({
    columns,
    stringLimit,
    limit,
    useYqlTypes,
}: {
    columns: any[];
    stringLimit?: number;
    limit?: number;
    useYqlTypes?: boolean;
}): ReadTableOutputFormat => {
    const filteredColumns = filter_(columns, (column) => column.checked || column.keyColumn);
    const columnNames = map_(filteredColumns, (column) => column.name);
    const outputFormat = getDefaultRequestOutputFormat({
        stringLimit,
        tableColumnLimit: limit,
        columnNamesLimit: 3000,
        useYqlTypes,
    });
    if (columnNames.length) {
        return {
            ...outputFormat,
            $attributes: {
                ...outputFormat.$attributes,
                column_names: columnNames,
            },
        };
    }
    return outputFormat;
};
