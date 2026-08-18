import React from 'react';
import cn from 'bem-cn-lite';

import {ArrowUpRightFromSquare, Database} from '@gravity-ui/icons';
import {Button, Flex, Icon, Loader, Switch, Text} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import {ClickableText} from '../../../../../components/ClickableText/ClickableText';
import {
    DataTableGravity,
    TableCell,
    selectionColumn,
    type tanstack,
    useTable,
} from '../../../../../components/DataTableGravity';
import {Yson, type YsonSettings} from '../../../../../components/Yson/Yson';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';
import Link from '../../../../../containers/Link/Link';
import {selectCluster} from '../../../../../store/selectors/global';
import {selectFlowSpecYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';

import {useSelector} from '../../../../../store/redux-hooks';

import {
    buildCompactYsonSettings,
    flattenReadStatesResponse,
    getStateRowId,
    isAnnotatedBigInteger,
    isRowDeletable,
    selectDeletableRows,
    serializeRawStateValue,
    stringifyStateValue,
} from '../helpers';
import i18n from './i18n';
import i18nApiValues from '../i18n-api-values';
import type {
    FlowStateCellHandlers,
    FlowStateResultRow,
    FlowStateResultSection,
    FlowStateRowFilterField,
} from '../types';
import type {FlowReadStatesResponse} from '../../../../../../shared/yt-types';

import './FlowStateResults.scss';

const block = cn('yt-flow-state-results');

type FlowStateApiValueKey = Parameters<typeof i18nApiValues>[0];

export const KIND_LABEL_KEYS: Record<FlowStateResultSection, FlowStateApiValueKey> = {
    key_state: 'value_kind-internal-key',
    partition_state: 'value_kind-internal-partition',
    external_key_state: 'value_kind-external',
    joined_external_key_state: 'value_kind-external-joiner',
};

export type FlowStateResultsProps = {
    response?: FlowReadStatesResponse;
    loading: boolean;
    error?: unknown;
    handlers: FlowStateCellHandlers;
    rowSelection: tanstack.RowSelectionState;
    onRowSelectionChange: tanstack.OnChangeFn<tanstack.RowSelectionState>;
    writeDenied: boolean;
    onDeleteSelected: () => void;
};

function CopyButton({text}: {text: string}) {
    if (!text) {
        return null;
    }
    return (
        <span className={block('hover-action')}>
            <ClipboardButton text={text} view="flat-secondary" />
        </span>
    );
}

function FilterCellValue({
    row,
    field,
    label,
    handlers,
}: {
    row: FlowStateResultRow;
    field: FlowStateRowFilterField;
    label: string;
    handlers: FlowStateCellHandlers;
}) {
    const update = handlers.getRowFilterUpdate(row, field);
    if (!update) {
        return <Text ellipsis>{label}</Text>;
    }
    return (
        <Text ellipsis>
            <ClickableText color="info" onClick={() => handlers.onFiltersChange(update)}>
                {label}
            </ClickableText>
        </Text>
    );
}

function useResultColumns({
    ysonSettings,
    cluster,
    handlers,
}: {
    ysonSettings: YsonSettings;
    cluster: string;
    handlers: FlowStateCellHandlers;
}): Array<tanstack.ColumnDef<FlowStateResultRow>> {
    const compactYsonSettings = React.useMemo(
        () => buildCompactYsonSettings(ysonSettings),
        [ysonSettings],
    );
    return React.useMemo(
        () => [
            {
                id: 'section',
                header: () => i18n('column_state-kind'),
                size: 160,
                accessorFn: (row) => row.section,
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <FilterCellValue
                            row={original}
                            field="target"
                            label={i18nApiValues(KIND_LABEL_KEYS[original.section])}
                            handlers={handlers}
                        />
                        <CopyButton text={original.section} />
                    </TableCell>
                ),
            },
            {
                id: 'computation',
                header: () => i18n('column_computation'),
                size: 200,
                accessorFn: (row) => row.computationId ?? '',
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <FilterCellValue
                            row={original}
                            field="computation"
                            label={original.computationId ?? ''}
                            handlers={handlers}
                        />
                        <Flex gap={1} alignItems="center">
                            <CopyButton text={original.computationId ?? ''} />
                            {original.computationId && (
                                <span className={block('hover-action')}>
                                    <Link
                                        className={block('row-link')}
                                        url={handlers.resolveComputationLink(
                                            original.computationId,
                                        )}
                                        routed
                                        title={i18n('link_open-computation-page')}
                                    >
                                        <Icon data={ArrowUpRightFromSquare} size={14} />
                                    </Link>
                                </span>
                            )}
                        </Flex>
                    </TableCell>
                ),
            },
            {
                id: 'partition',
                header: () => i18n('column_partition'),
                size: 200,
                accessorFn: (row) => row.partitionId ?? '',
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <Text ellipsis>{original.partitionId ?? ''}</Text>
                        <CopyButton text={original.partitionId ?? ''} />
                    </TableCell>
                ),
            },
            {
                id: 'key',
                header: () => i18n('column_key'),
                size: 200,
                accessorFn: (row) => stringifyStateValue(row.key),
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <FilterCellValue
                            row={original}
                            field="key"
                            label={stringifyStateValue(original.key)}
                            handlers={handlers}
                        />
                        <CopyButton text={serializeRawStateValue(original.key)} />
                    </TableCell>
                ),
            },
            {
                id: 'state-name',
                header: () => i18n('column_state-name'),
                size: 200,
                accessorFn: (row) => row.stateName,
                cell: ({row: {original}}) => {
                    const location = handlers.resolveStoragePath(original);
                    return (
                        <TableCell justifyContent="space-between">
                            <FilterCellValue
                                row={original}
                                field="stateName"
                                label={original.stateName}
                                handlers={handlers}
                            />
                            <Flex gap={1} alignItems="center">
                                <CopyButton text={original.stateName} />
                                {location && (
                                    <span className={block('hover-action')}>
                                        <Link
                                            className={block('row-link')}
                                            url={genNavigationUrl({
                                                cluster: location.cluster ?? cluster,
                                                path: location.path,
                                            })}
                                            routed
                                            title={location.path}
                                        >
                                            <Icon data={Database} size={14} />
                                        </Link>
                                    </span>
                                )}
                            </Flex>
                        </TableCell>
                    );
                },
            },
            {
                id: 'value',
                header: () => i18n('column_value'),
                size: 320,
                accessorFn: (row) => stringifyStateValue(row.value),
                cell: ({row: {original}}) => {
                    const expandable =
                        typeof original.value === 'object' &&
                        original.value !== null &&
                        !isAnnotatedBigInteger(original.value);
                    return (
                        <TableCell justifyContent="space-between">
                            <div className={block('value-cell')}>
                                <Yson
                                    value={original.value}
                                    settings={compactYsonSettings}
                                    inline
                                />
                            </div>
                            <Flex gap={1} alignItems="center">
                                <CopyButton text={serializeRawStateValue(original.value)} />
                                {expandable && (
                                    <ClickableAttributesButton
                                        title={original.stateName}
                                        attributes={original.value as object}
                                        view="flat-secondary"
                                        size="s"
                                    />
                                )}
                            </Flex>
                        </TableCell>
                    );
                },
            },
        ],
        [ysonSettings, compactYsonSettings, cluster, handlers],
    );
}

function FlowStateResultsTable({
    rows,
    ysonSettings,
    cluster,
    handlers,
    rowSelection,
    onRowSelectionChange,
}: {
    rows: Array<FlowStateResultRow>;
    ysonSettings: YsonSettings;
    cluster: string;
    handlers: FlowStateCellHandlers;
    rowSelection: tanstack.RowSelectionState;
    onRowSelectionChange: tanstack.OnChangeFn<tanstack.RowSelectionState>;
}) {
    const columns = useResultColumns({ysonSettings, cluster, handlers});
    const allColumns = React.useMemo(
        () => [selectionColumn as unknown as tanstack.ColumnDef<FlowStateResultRow>, ...columns],
        [columns],
    );
    const [sorting, setSorting] = React.useState<tanstack.SortingState>([]);

    const table = useTable({
        columns: allColumns,
        data: rows,
        state: {sorting, rowSelection},
        onSortingChange: setSorting,
        onRowSelectionChange,
        enableSorting: true,
        enableRowSelection: (row) => isRowDeletable(row.original),
        getRowId: (row) => getStateRowId(row),
    });

    return <DataTableGravity table={table} virtualized rowHeight={40} />;
}

export function FlowStateResults({
    response,
    loading,
    error,
    handlers,
    rowSelection,
    onRowSelectionChange,
    writeDenied,
    onDeleteSelected,
}: FlowStateResultsProps) {
    const [raw, setRaw] = React.useState(false);
    const ysonSettings = useSelector(selectFlowSpecYsonSettings);
    const cluster = useSelector(selectCluster);

    const rows = React.useMemo(() => flattenReadStatesResponse(response), [response]);
    const selectedCount = React.useMemo(
        () => selectDeletableRows(rows, rowSelection).length,
        [rows, rowSelection],
    );

    if (error) {
        return <YTErrorBlock error={error as YTErrorBlockProps['error']} />;
    }

    if (!response) {
        return loading ? <Loader size="m" /> : <Text color="hint">{i18n('text_no-results')}</Text>;
    }

    return (
        <Flex direction="column" gap={2} className={block()}>
            {selectedCount > 0 && (
                <Flex gap={3} alignItems="center">
                    <Text color="secondary">
                        {i18n('text_selected-rows', {count: String(selectedCount)})}
                    </Text>
                    <Button
                        view="outlined-danger"
                        disabled={writeDenied}
                        onClick={onDeleteSelected}
                    >
                        {i18n('action_delete')}
                    </Button>
                    {writeDenied && (
                        <Text color="secondary">{i18n('alert_no-write-permission')}</Text>
                    )}
                </Flex>
            )}
            {(response.errors ?? []).map((message, index) => (
                <YTErrorBlock key={`${index}:${message}`} error={{message}} />
            ))}
            <div className={block('content', {loading})}>
                {loading && (
                    <div className={block('content-loader')}>
                        <Loader size="s" />
                    </div>
                )}
                {raw ? (
                    <YsonWithScroll value={response} settings={ysonSettings} />
                ) : (
                    <FlowStateResultsTable
                        rows={rows}
                        ysonSettings={ysonSettings}
                        cluster={cluster}
                        handlers={handlers}
                        rowSelection={rowSelection}
                        onRowSelectionChange={onRowSelectionChange}
                    />
                )}
            </div>
            <Flex gap={4} alignItems="center">
                <Switch
                    checked={raw}
                    onUpdate={(next) => {
                        setRaw(next);
                        if (next) {
                            onRowSelectionChange({});
                        }
                    }}
                >
                    {i18n('label_raw-yson')}
                </Switch>
                <Text color="secondary">
                    {rows.length} {i18n('label_rows')}
                </Text>
            </Flex>
        </Flex>
    );
}

export default FlowStateResults;
