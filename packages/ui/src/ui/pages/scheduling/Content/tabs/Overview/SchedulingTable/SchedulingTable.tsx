import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import moment from 'moment';

import {DropdownMenu, Flex, Text} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import ColumnHeader from '../../../../../../components/ColumnHeader/ColumnHeader';
import {
    DataTableGravity,
    TableCell,
    useTable,
    tanstack,
} from '../../../../../../components/DataTableGravity';
import {
    FormatNumber,
    FormatNumberProps,
} from '../../../../../../components/FormatNumber/FormatNumber';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import {OperationType} from '../../../../../../components/OperationType/OperationType';
import {SubjectCard} from '../../../../../../components/SubjectLink/SubjectLink';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import {getSchedulingOperationsLoading} from '../../../../../../store/selectors/scheduling/expanded-pools';
import {getSchedulingOverviewTableItems} from '../../../../../../store/selectors/scheduling/scheduling';
import {getPoolPathsByName} from '../../../../../../store/actions/scheduling/expanded-pools';
import {openAttributesModal} from '../../../../../../store/actions/modals/attributes-modal';
import {useThunkDispatch} from '../../../../../../store/thunkDispatch';

import {NameCell} from './NameCell';
import PoolTags from './PoolTags';
import i18n from './i18n';
import './SchedulingTable.scss';
import {openEditModal} from '../../../../../../store/actions/scheduling/scheduling';
import {openPoolDeleteModal} from '../../../../../../store/actions/scheduling/scheduling-ts';

const block = cn('yt-scheduling-table');

export type RowData = ReturnType<typeof getSchedulingOverviewTableItems>[number];

export function SchedulingTable() {
    const items = useSelector(getSchedulingOverviewTableItems);
    const columns = useSchedulingTableColumns();

    const table = useTable({
        columns,
        data: items,
        enableColumnPinning: true,
        state: {
            columnPinning: {
                left: ['name'],
                right: ['actions'],
            },
            columnSizing: {startOffset: 100},
        },
    });

    return <DataTableGravity className={block()} table={table} />;
}

export function useSchedulingTableColumns() {
    const columns = React.useMemo(() => {
        const res: Array<tanstack.ColumnDef<RowData>> = [
            {
                id: 'name',
                header: () => <NameHeader />,
                size: 100,
                cell: ({row: {original: item}}) => {
                    return <NameCell row={item} />;
                },
            },
            {
                id: 'actions',
                header: () => null,
                size: 50,
                cell: ({row: {original: item}}) => {
                    return <RowActions item={item} />;
                },
            },
            {
                id: 'weight',
                header: () => <ColumnHeader column={'weight'} />,
                cell: ({row: {original: item}}) => {
                    const {weightEdited = NaN, type, weight} = item;
                    return (
                        <TableCell>
                            {type === 'pool' ? (
                                <EditedNumber
                                    value={weight}
                                    edited={weightEdited}
                                    type="NumberSmart"
                                />
                            ) : (
                                <FormatNumber value={weight} type="NumberSmart" />
                            )}
                        </TableCell>
                    );
                },
            },
            {
                id: 'type',
                header: () => <ColumnHeader column={'type'} />,
                cell: ({row: {original: item}}) => {
                    const {type} = item;
                    return (
                        <TableCell>
                            {type === 'pool' ? (
                                <PoolTags pool={item} />
                            ) : (
                                <OperationType value={item.operationType} />
                            )}
                        </TableCell>
                    );
                },
            },
            {
                id: 'user',
                header: () => <ColumnHeader column="user" title="Owner" />,
                cell: ({row: {original: item}}) => {
                    const {user} = item;
                    return (
                        <TableCell>
                            {user ? <SubjectCard name={user} type="user" /> : format.NO_VALUE}
                        </TableCell>
                    );
                },
            },
            {
                id: 'dominantResource',
                header: () => <ColumnHeader column="dominantResource" title="Dom.res" />,
                cell: ({row: {original: item}}) => {
                    const {dominantResource} = item;
                    return <TableCell>{dominantResource?.toUpperCase()}</TableCell>;
                },
            },
            {
                id: 'usage',
                header: () => <ColumnHeader column="usage" />,
                cell: ({row: {original: item}}) => {
                    const {} = item;
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="usage" />
                        </TableCell>
                    );
                },
                size: 140,
            },
            {
                id: 'demand',
                header: () => <ColumnHeader column="demand" />,
                cell: ({row: {original: item}}) => {
                    const {} = item;
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="demand" />
                        </TableCell>
                    );
                },
                size: 140,
            },
            {
                id: 'guaranteed',
                header: () => <ColumnHeader column="guaranteed" title="Guarantee" />,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="guaranteed" />
                        </TableCell>
                    );
                },
                size: 140,
            },
            {
                id: 'running',
                header: () => <ColumnHeader column="running" />,
                cell: ({row: {original: item}}) => {
                    const {maxOperationCount, maxOperationCountEdited, runningOperationCount} =
                        item;
                    return (
                        <TableCell>
                            <Text variant="inherit" ellipsis>
                                <FormatNumber value={runningOperationCount} type="NumberSmart" />
                                &nbsp;/&nbsp;
                                <EditedNumber
                                    value={maxOperationCount}
                                    edited={maxOperationCountEdited}
                                    type="NumberSmart"
                                />
                            </Text>
                        </TableCell>
                    );
                },
            },
            {
                id: 'duaration',
                header: () => <ColumnHeader column="duration" />,
                cell: ({row: {original: item}}) => {
                    const {startTime} = item;
                    return (
                        <TableCell>
                            <Duration start={startTime} />
                        </TableCell>
                    );
                },
            },
            {
                id: 'actions',
                header: () => null,
                size: 50,
                cell: ({row: {original: item}}) => {
                    return <RowActions item={item} />;
                },
            },
        ];
        return res;
    }, []);
    return columns;
}

function NameHeader() {
    const loading = useSelector(getSchedulingOperationsLoading);
    return <ColumnHeader title={i18n('pool-operation')} column="name" loading={loading} />;
}

type ResourceSummaryProps = {
    item: RowData;
    type: 'usage' | 'demand' | 'guaranteed';
};

function ResourceSummary({item, type}: ResourceSummaryProps) {
    const {dominantResource = 'cpu'} = item;

    const {cpu, gpu, user_memory} = item.resources ?? {};

    const cpuContent = format.NumberSmart(cpu?.[type]) + ' CPU';
    const gpuContent = format.NumberSmart(gpu?.[type]) + ' GPU';
    const memContent = format.Bytes(user_memory?.[type]);

    const l1 = dominantResource === 'cpu' ? cpuContent : gpuContent;
    const l2 =
        dominantResource === 'cpu'
            ? `${gpuContent}, ${memContent}`
            : `${cpuContent}, ${memContent}`;
    return (
        <Flex direction="column" style={{margin: '-8px 0'}} overflow="hidden">
            <Text variant="subheader-1" style={{fontWeight: 'var(--yt-font-weight-bold)'}} ellipsis>
                {l1}
            </Text>
            <Text variant="caption-2" color="secondary" ellipsis>
                {l2}
            </Text>
        </Flex>
    );
}

type EditedNumberProps = {
    value?: number;
    edited?: number;

    type: FormatNumberProps['type'];
};

function EditedNumber({value, edited, type}: EditedNumberProps) {
    const autocalculated = isNaN(edited!);
    const content = autocalculated ? 'Automatically calculated' : 'Explicitly defined';

    return (
        <FormatNumber
            className={block('edited-number', {autocalculated})}
            tooltip={content}
            value={value}
            type={type}
        />
    );
}

function Duration({start}: {start?: string}) {
    if (!start) {
        return null;
    }

    const from = moment(start).valueOf();
    return (
        <Tooltip
            content={
                <MetaTable
                    items={[
                        {
                            key: 'start time',
                            value: format.DateTime(from / 1000),
                        },
                    ]}
                />
            }
        >
            {format.TimeDuration(Date.now() - from)}
        </Tooltip>
    );
}

function RowActions({item}: {item: RowData}) {
    const dispatch = useThunkDispatch();

    const {name, type, isEphemeral, attributes} = item;
    const editable = !isEphemeral && type === 'pool';

    return (
        <DropdownMenu
            items={compact_([
                {
                    action: () => {
                        const exactPath = dispatch(getPoolPathsByName(name))?.orchidPath;
                        if (type === 'pool') {
                            dispatch(openAttributesModal({title: item.name, exactPath}));
                        } else {
                            dispatch(openAttributesModal({title: item.name, attributes}));
                        }
                    },
                    text: 'Show attributes',
                },
                ...(editable
                    ? [
                          {
                              action: () => dispatch(openEditModal(item)),
                              text: 'Edit',
                          },
                          {
                              action: () => dispatch(openPoolDeleteModal(item)),
                              text: 'Delete',
                              theme: 'danger' as const,
                          },
                      ]
                    : []),
            ])}
        />
    );
}
