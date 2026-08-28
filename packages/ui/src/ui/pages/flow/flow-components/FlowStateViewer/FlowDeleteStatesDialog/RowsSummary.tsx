import React from 'react';
import cn from 'bem-cn-lite';

import {Table, type TableColumnConfig, Text} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import {KIND_LABEL_KEYS} from '../FlowStateResults/FlowStateResults';
import {getStateRowId} from '../state-requests';
import {serializeRawStateValue} from '../state-values';
import i18n from './i18n';
import i18nApiValues from '../i18n-api-values';
import type {FlowStateResultRow} from '../types';

import './RowsSummary.scss';

const block = cn('yt-flow-delete-states-rows-summary');
const MAX_LISTED_ROWS = 20;

type PreviewRow = FlowStateResultRow & {id: string};

function CompleteValue({value}: {value: unknown}) {
    const text = serializeRawStateValue(value);
    return (
        <span className={block('complete-value')}>
            <Text className={block('complete-value-text')}>{text}</Text>
            <span className={block('hover-action')}>
                <ClipboardButton
                    text={text}
                    view="flat-secondary"
                    aria-label={i18n('action_copy-value')}
                    title={i18n('action_copy-value')}
                />
            </span>
        </span>
    );
}

const previewColumns: Array<TableColumnConfig<PreviewRow>> = [
    {id: 'computationId', name: () => i18n('column_computation')},
    {
        id: 'section',
        name: () => i18n('column_state-kind'),
        template: (row) => i18nApiValues(KIND_LABEL_KEYS[row.section]),
    },
    {id: 'stateName', name: () => i18n('column_state-name')},
    {id: 'partitionId', name: () => i18n('column_partition')},
    {
        id: 'key',
        name: () => i18n('column_key'),
        template: (row) => serializeRawStateValue(row.key),
    },
    {
        id: 'value',
        name: () => i18n('column_value'),
        template: (row) => <CompleteValue value={row.value} />,
    },
];

export function RowsSummary({rows}: {rows: Array<FlowStateResultRow>}) {
    const listed = rows.slice(0, MAX_LISTED_ROWS).map((row) => ({
        ...row,
        id: getStateRowId(row),
    }));
    return (
        <div className={block()}>
            <Text>{i18n('text_delete-selected-explanation', {count: String(rows.length)})}</Text>
            <div className={block('table-pane')}>
                <Table
                    className={block('table')}
                    columns={previewColumns}
                    data={listed}
                    getRowId="id"
                    verticalAlign="middle"
                />
            </div>
            {rows.length > MAX_LISTED_ROWS && (
                <Text color="secondary">
                    {i18n('text_and-n-more', {count: String(rows.length - MAX_LISTED_ROWS)})}
                </Text>
            )}
        </div>
    );
}
