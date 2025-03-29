import {validateExportDirectory, validateExportPeriod} from './validate';

export const fields = [
    {
        name: 'name',
        type: 'text' as const,
        caption: 'Export name',
        required: true,
    },
    {
        type: 'path' as const,
        name: 'export_directory',
        required: true,
        caption: 'Export directory',
        validator: validateExportDirectory,
    },
    {
        type: 'number' as const,
        name: 'export_period',
        caption: 'Export period',
        required: true,
        extras: {
            validator: validateExportPeriod,
        },
    },
    {
        type: 'text' as const,
        name: 'output_table_name_pattern',
        caption: 'Output table name pattern',
    },
    {
        type: 'tumbler' as const,
        name: 'use_upper_bound_for_table_names',
        caption: 'Use upper bound for table names',
    },
    {
        type: 'time-duration' as const,
        name: 'export_ttl',
        caption: 'TTL',
    },
];
