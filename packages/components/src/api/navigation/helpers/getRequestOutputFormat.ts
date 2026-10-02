import {getDefaultRequestOutputFormat} from './getDefaultRequestOutputFormat';
import {ReadTableOutputFormat} from '../../../types/yt-types';

export const getRequestOutputFormat = ({
    columns,
    stringLimit,
    limit,
    useYqlTypes,
}: {
    columns?: string[];
    stringLimit?: number;
    limit?: number;
    useYqlTypes?: boolean;
}): ReadTableOutputFormat => {
    const outputFormat = getDefaultRequestOutputFormat({
        stringLimit,
        tableColumnLimit: limit,
        columnNamesLimit: 3000,
        useYqlTypes,
    });
    if (columns?.length) {
        return {
            ...outputFormat,
            $attributes: {
                ...outputFormat.$attributes,
                column_names: columns,
            },
        };
    }
    return outputFormat;
};
