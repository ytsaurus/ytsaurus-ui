import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Table, type TableColumnConfig, Text} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import {Yson, type YsonSettings} from '../../../../../components/Yson/Yson';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectFlowSpecYsonSettings} from '../../../../../store/selectors/thor/unipika';

import {getStateRowId} from '../state-requests';
import {buildCompactYsonSettings, serializeRawStateValue} from '../state-value-format';
import i18n from './i18n';
import type {FlowStateResultRow} from '../types';

import './RowsSummary.scss';

const block = cn('yt-flow-delete-states-rows-summary');
const MAX_LISTED_ROWS = 20;

type PreviewRow = FlowStateResultRow & {id: string};

function CompleteValue({value, settings}: {value: unknown; settings: YsonSettings}) {
    const text = serializeRawStateValue(value);
    return (
        <Flex as="span" alignItems="center" gap={1} className={block('complete-value')}>
            <Yson
                className={block('complete-value-text')}
                value={value}
                settings={settings}
                inline
            />
            <Flex
                as="span"
                inline
                grow={0}
                shrink={0}
                basis="auto"
                className={block('hover-action')}
            >
                <ClipboardButton
                    text={text}
                    view="flat-secondary"
                    aria-label={i18n('action_copy-value')}
                    title={i18n('action_copy-value')}
                />
            </Flex>
        </Flex>
    );
}

const requiredColumns: Array<TableColumnConfig<PreviewRow>> = [
    {id: 'computationId', name: () => i18n('column_computation')},
    {id: 'stateName', name: () => i18n('column_state-name')},
];

const partitionColumn: TableColumnConfig<PreviewRow> = {
    id: 'partitionId',
    name: () => i18n('column_partition'),
};

function getPreviewColumns(
    rows: Array<FlowStateResultRow>,
    settings: YsonSettings,
): Array<TableColumnConfig<PreviewRow>> {
    const keyColumn: TableColumnConfig<PreviewRow> = {
        id: 'key',
        name: () => i18n('column_key'),
        template: (row) =>
            row.key === undefined ? null : <Yson value={row.key} settings={settings} inline />,
    };
    const valueColumn: TableColumnConfig<PreviewRow> = {
        id: 'value',
        name: () => i18n('column_value'),
        template: (row) => <CompleteValue value={row.value} settings={settings} />,
    };
    return [
        ...requiredColumns,
        ...(rows.some((row) => Boolean(row.partitionId)) ? [partitionColumn] : []),
        ...(rows.some((row) => row.key !== undefined && row.key !== null) ? [keyColumn] : []),
        valueColumn,
    ];
}

export function RowsSummary({rows}: {rows: Array<FlowStateResultRow>}) {
    const ysonSettings = useSelector(selectFlowSpecYsonSettings);
    // State responses already contain decoded Unicode strings.
    const settings = buildCompactYsonSettings({...ysonSettings, decodeUTF8: false});
    const listed = rows.slice(0, MAX_LISTED_ROWS).map((row) => ({
        ...row,
        id: getStateRowId(row),
    }));
    return (
        <Flex direction="column" gap={2} className={block()}>
            <Text>{i18n('text_delete-selected-explanation', {count: String(rows.length)})}</Text>
            <div className={block('table-pane')}>
                <Table
                    className={block('table')}
                    columns={getPreviewColumns(rows, settings)}
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
        </Flex>
    );
}
