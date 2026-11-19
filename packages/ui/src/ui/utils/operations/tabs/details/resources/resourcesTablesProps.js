import React from 'react';

import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';

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
                renderHeader() {
                    return <ColumnHeader column="name" title={i18n('field_name')} align="left" />;
                },
            },
            row_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader column="row_count" title={i18n('field_rows')} align="right" />
                    );
                },
            },
            compressed_data_size: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="compressed_data_size"
                            title={i18n('field_compressed')}
                            align="right"
                        />
                    );
                },
            },
            uncompressed_data_size: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="uncompressed_data_size"
                            title={i18n('field_uncompressed')}
                            align="right"
                        />
                    );
                },
            },
            data_weight: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="data_weight"
                            title={i18n('field_weight')}
                            align="right"
                        />
                    );
                },
            },
            chunk_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="chunk_count"
                            title={i18n('field_slices')}
                            align="right"
                        />
                    );
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
                renderHeader() {
                    return (
                        <ColumnHeader column="account" title={i18n('field_account')} align="left" />
                    );
                },
            },
            disk_space: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="disk_space"
                            title={i18n('field_disk-space')}
                            align="right"
                        />
                    );
                },
            },
            chunk_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="chunk_count"
                            title={i18n('field_slices')}
                            align="right"
                        />
                    );
                },
            },
            node_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    return (
                        <ColumnHeader
                            column="node_count"
                            title={i18n('field_nodes')}
                            align="right"
                        />
                    );
                },
            },
        }),
        mode: 'default',
    },
    templates: {
        key: 'operations/detail/resources/intermediate',
    },
};
