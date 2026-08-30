import {type DownloadFormat} from './types';

export const CSV_SEPARATORS = {
    record: '\n',
    field: ',',
};

export const FILE_EXTENSION_BY_FORMAT: Record<DownloadFormat, string> = {
    dsv: '.tskv',
    schemaful_dsv: '.dsv',
    csv: '.csv',
    yson: '.yson',
    json: '.json',
    excel: '.xlsx',
};
