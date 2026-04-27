import {prepareTableColumns} from '../../../../../utils/index';
import i18n from './i18n';

const METRICS = [
    'row_count',
    'compressed_data_size',
    'uncompressed_data_size',
    'data_weight',
    'chunk_count',
];

const props = {
    theme: 'light',
    size: 'm',
    striped: false,
    virtual: false,
};

export const completedTableProps = {
    ...props,
    columns: {
        sets: {
            default: {
                items: ['name', ...METRICS],
            },
            withActions: {
                items: ['name', ...METRICS, 'actions'],
            },
        },
        items: prepareTableColumns({
            name: {
                sort: false,
                align: 'left',
            },
            row_count: {
                sort: false,
                align: 'right',
            },
            compressed_data_size: {
                sort: false,
                align: 'right',
                get caption() {
                    return i18n('field_compressed');
                },
            },
            uncompressed_data_size: {
                sort: false,
                align: 'right',
                get caption() {
                    return i18n('field_uncompressed');
                },
            },
            data_weight: {
                sort: false,
                align: 'right',
            },
            chunk_count: {
                sort: false,
                align: 'right',
                get caption() {
                    return i18n('field_slices');
                },
            },
            actions: {
                sort: false,
                caption: '',
            },
        }),
        mode: 'default',
    },
};

export const intermediateTableProps = {
    ...props,
    columns: {
        sets: {
            default: {
                items: ['account', 'node_count', 'disk_space', 'chunk_count'],
            },
        },
        items: prepareTableColumns({
            account: {
                sort: false,
                align: 'left',
            },
            disk_space: {
                sort: false,
                align: 'right',
            },
            chunk_count: {
                sort: false,
                align: 'right',
                get caption() {
                    return i18n('field_slices');
                },
            },
            node_count: {
                sort: false,
                align: 'right',
            },
        }),
        mode: 'default',
    },
    templates: {
        key: 'operations/detail/resources/intermediate',
    },
};
