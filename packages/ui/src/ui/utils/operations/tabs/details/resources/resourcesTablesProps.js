import React from 'react';

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
                    const caption = i18n('field_name');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            row_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_rows');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            compressed_data_size: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_compressed');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            uncompressed_data_size: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_uncompressed');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            data_weight: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_weight');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            chunk_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_slices');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
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
                    const caption = i18n('field_account');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            disk_space: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_disk-space');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            chunk_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_slices');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
                    );
                },
            },
            node_count: {
                sort: false,
                align: 'right',
                renderHeader() {
                    const caption = i18n('field_nodes');
                    return (
                        <div className="elements-table__column-name" title={caption}>
                            {caption}
                        </div>
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
