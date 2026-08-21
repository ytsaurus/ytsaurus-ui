import React from 'react';
import cn from 'bem-cn-lite';

import {ArrowUpRightFromSquare, Database, TrashBin} from '@gravity-ui/icons';
import {Button, Flex, HelpMark, Icon, Loader, Text} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import {ClickableText} from '../../../../../components/ClickableText/ClickableText';
import {NoContent} from '../../../../../components/NoContent';
import {
    DataTableGravity,
    TableCell,
    selectionColumn,
    type tanstack,
    useTable,
} from '../../../../../components/DataTableGravity';
import {Yson, type YsonSettings} from '../../../../../components/Yson/Yson';
import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';
import {RoutedLink} from '../../../../../containers/RoutedLink/RoutedLink';
import {selectCluster} from '../../../../../store/selectors/global';
import {selectFlowSpecYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';

import {useSelector} from '../../../../../store/redux-hooks';

import {isAnnotatedBigInteger} from '../../../../../store/api/yt/flow/read-states-normalize';
import {
    READ_STATES_LIMIT,
    flattenReadStatesResponse,
    getStateRowId,
    isRowDeletable,
    selectDeletableRows,
} from '../state-requests';
import {
    buildCompactYsonSettings,
    serializeRawStateValue,
    stringifyStateValue,
} from '../state-values';
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
    hasScope: boolean;
    response?: FlowReadStatesResponse;
    initialLoading: boolean;
    refreshing: boolean;
    readSucceeded: boolean;
    error?: unknown;
    handlers: FlowStateCellHandlers;
    rowSelection: tanstack.RowSelectionState;
    onRowSelectionChange: tanstack.OnChangeFn<tanstack.RowSelectionState>;
    writeDenied: boolean;
    onDeleteRows: (rows: Array<FlowStateResultRow>) => void;
};

function CopyButton({text}: {text: string}) {
    if (!text) {
        return null;
    }
    return (
        <span className={block('hover-action')}>
            <ClipboardButton
                text={text}
                view="flat-secondary"
                aria-label={i18n('action_copy-value')}
                title={i18n('action_copy-value')}
            />
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
    if (update) {
        return (
            <Text ellipsis>
                <ClickableText color="info" onClick={() => handlers.onFiltersChange(update)}>
                    {label}
                </ClickableText>
            </Text>
        );
    }
    if (handlers.isRowFilterActive(row, field)) {
        return (
            <Text ellipsis color="secondary" title={i18n('hint_filter-already-applied')}>
                {label}
            </Text>
        );
    }
    return <Text ellipsis>{label}</Text>;
}

function ColumnHeader({title, hint}: {title: string; hint: string}) {
    return (
        <Flex inline gap={1} alignItems="center" wrap="nowrap">
            {title}
            <HelpMark iconSize="s" onClick={(event) => event.stopPropagation()}>
                {hint}
            </HelpMark>
        </Flex>
    );
}

function useResultColumns({
    ysonSettings,
    cluster,
    handlers,
    writeDenied,
    onDeleteRows,
}: {
    ysonSettings: YsonSettings;
    cluster: string;
    handlers: FlowStateCellHandlers;
    writeDenied: boolean;
    onDeleteRows: (rows: Array<FlowStateResultRow>) => void;
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
                size: 140,
                accessorFn: (row) => row.section,
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <FilterCellValue
                            row={original}
                            field="target"
                            label={i18nApiValues(KIND_LABEL_KEYS[original.section])}
                            handlers={handlers}
                        />
                    </TableCell>
                ),
            },
            {
                id: 'computation',
                header: () => i18n('column_computation'),
                size: 160,
                accessorFn: (row) => row.computationId ?? '',
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <FilterCellValue
                            row={original}
                            field="computation"
                            label={original.computationId ?? ''}
                            handlers={handlers}
                        />
                        {original.computationId && (
                            <RoutedLink
                                className={block('row-link')}
                                href={handlers.resolveComputationLink(original.computationId)}
                                title={i18n('link_open-computation-page')}
                            >
                                <Icon data={ArrowUpRightFromSquare} size={14} />
                            </RoutedLink>
                        )}
                    </TableCell>
                ),
            },
            {
                id: 'partition',
                header: () => i18n('column_partition'),
                size: 160,
                accessorFn: (row) => row.partitionId ?? '',
                cell: ({row: {original}}) => (
                    <TableCell>
                        <Text ellipsis>{original.partitionId ?? ''}</Text>
                    </TableCell>
                ),
            },
            {
                id: 'key',
                header: () => i18n('column_key'),
                size: 160,
                accessorFn: (row) => stringifyStateValue(row.key),
                cell: ({row: {original}}) => (
                    <TableCell justifyContent="space-between">
                        <FilterCellValue
                            row={original}
                            field="key"
                            label={stringifyStateValue(original.key)}
                            handlers={handlers}
                        />
                    </TableCell>
                ),
            },
            {
                id: 'state-name',
                header: () => (
                    <ColumnHeader
                        title={i18n('column_state-name')}
                        hint={i18n('hint_state-name')}
                    />
                ),
                size: 170,
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
                            {location && (
                                <RoutedLink
                                    aria-label={i18n('link_open-backing-storage')}
                                    className={block('row-link')}
                                    href={genNavigationUrl({
                                        cluster: location.cluster ?? cluster,
                                        path: location.path,
                                    })}
                                    title={i18n('link_open-backing-storage')}
                                >
                                    <Icon data={Database} size={14} />
                                </RoutedLink>
                            )}
                        </TableCell>
                    );
                },
            },
            {
                id: 'value',
                header: () => i18n('column_value'),
                size: 260,
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
                                        aria-label={i18n('tooltip_show-value')}
                                        title={original.stateName}
                                        attributes={original.value as object}
                                        view="flat-secondary"
                                        size="s"
                                        tooltipProps={{
                                            placement: 'bottom-end',
                                            content: i18n('tooltip_show-value'),
                                        }}
                                    />
                                )}
                            </Flex>
                        </TableCell>
                    );
                },
            },
            {
                id: 'delete',
                header: () => null,
                size: 48,
                enableSorting: false,
                cell: ({row: {original}}) => (
                    <Button
                        view="flat-secondary"
                        aria-label={i18n('action_delete-row')}
                        title={i18n('action_delete-row')}
                        disabled={writeDenied || !isRowDeletable(original)}
                        onClick={() => onDeleteRows([original])}
                    >
                        <Icon data={TrashBin} size={16} />
                    </Button>
                ),
            },
        ],
        [compactYsonSettings, cluster, handlers, onDeleteRows, writeDenied],
    );
}

function FlowStateResultsTable({
    rows,
    ysonSettings,
    cluster,
    handlers,
    rowSelection,
    onRowSelectionChange,
    writeDenied,
    onDeleteRows,
}: {
    rows: Array<FlowStateResultRow>;
    ysonSettings: YsonSettings;
    cluster: string;
    handlers: FlowStateCellHandlers;
    rowSelection: tanstack.RowSelectionState;
    onRowSelectionChange: tanstack.OnChangeFn<tanstack.RowSelectionState>;
    writeDenied: boolean;
    onDeleteRows: (rows: Array<FlowStateResultRow>) => void;
}) {
    const columns = useResultColumns({
        ysonSettings,
        cluster,
        handlers,
        writeDenied,
        onDeleteRows,
    });
    const allColumns = React.useMemo(
        () => [selectionColumn as unknown as tanstack.ColumnDef<FlowStateResultRow>, ...columns],
        [columns],
    );
    const [sorting, setSorting] = React.useState<tanstack.SortingState>([]);

    const table = useTable({
        columns: allColumns,
        data: rows,
        state: {sorting, rowSelection, columnPinning: {right: ['delete']}},
        onSortingChange: setSorting,
        onRowSelectionChange,
        enableSorting: true,
        enableColumnPinning: true,
        enableMultiRowSelection: true,
        enableRowSelection: (row) => isRowDeletable(row.original),
        getRowId: (row) => getStateRowId(row),
    });

    return (
        <div className={block('table-pane')}>
            <DataTableGravity table={table} virtualized rowHeight={40} />
        </div>
    );
}

export function FlowStateResults({
    hasScope,
    response,
    initialLoading,
    refreshing,
    readSucceeded,
    error,
    handlers,
    rowSelection,
    onRowSelectionChange,
    writeDenied,
    onDeleteRows,
}: FlowStateResultsProps) {
    const ysonSettings = useSelector(selectFlowSpecYsonSettings);
    const cluster = useSelector(selectCluster);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const rows = React.useMemo(() => flattenReadStatesResponse(response), [response]);
    const selectedCount = React.useMemo(
        () => selectDeletableRows(rows, rowSelection).length,
        [rows, rowSelection],
    );

    React.useEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }
        if (refreshing) {
            content.setAttribute('inert', '');
        } else {
            content.removeAttribute('inert');
        }
    }, [refreshing]);

    if (error) {
        return <YTErrorBlock error={error as YTErrorBlockProps['error']} />;
    }

    if (initialLoading) {
        return (
            <div role="status">
                <Loader size="m" />
                <span className={block('status-label')}>{i18n('status_loading')}</span>
            </div>
        );
    }

    if (!hasScope || !response) {
        return null;
    }

    if (readSucceeded && !refreshing && rows.length === 0 && (response.errors ?? []).length === 0) {
        return <NoContent hint={i18n('text_no-results')} />;
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
                        onClick={() => onDeleteRows(selectDeletableRows(rows, rowSelection))}
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
            <Flex gap={3} alignItems="center" justifyContent="space-between">
                <Text color="secondary">
                    {i18n('text_bounded-results', {limit: String(READ_STATES_LIMIT)})}
                </Text>
                <ClickableAttributesButton
                    aria-label={i18n('tooltip_show-raw-response')}
                    title={i18n('title_raw-response')}
                    attributes={response}
                    view="flat-secondary"
                    size="s"
                    tooltipProps={{
                        placement: 'bottom-end',
                        content: i18n('tooltip_show-raw-response'),
                    }}
                />
            </Flex>
            <div
                ref={contentRef}
                data-testid="results-content"
                className={block('content', {loading: refreshing})}
                aria-busy={refreshing}
            >
                {refreshing && (
                    <div className={block('content-loader')} role="status">
                        <Loader size="s" />
                        <span className={block('status-label')}>{i18n('status_refreshing')}</span>
                    </div>
                )}
                <FlowStateResultsTable
                    rows={rows}
                    ysonSettings={ysonSettings}
                    cluster={cluster}
                    handlers={handlers}
                    rowSelection={rowSelection}
                    onRowSelectionChange={onRowSelectionChange}
                    writeDenied={writeDenied}
                    onDeleteRows={onDeleteRows}
                />
            </div>
        </Flex>
    );
}
