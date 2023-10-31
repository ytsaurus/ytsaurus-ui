import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';
import {Column} from '@gravity-ui/react-data-table';

import format from '../../../common/hammer/format';

import DataTableYT, {
    DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR,
} from '../../../components/DataTableYT/DataTableYT';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';
import {OperationId} from '../../../components/OperationId/OperationId';
import {UserCard} from '../../../components/UserLink/UserLink';

import {chytToggleSortState} from '../../../store/actions/chyt/list-fitlers';
import {getCluster} from '../../../store/selectors/global';
import {
    getChytListTableItems,
    getChytListTableSortStateByName,
} from '../../../store/selectors/chyt';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {chytListAction} from '../../../store/actions/chyt/list';
import {Page} from '../../../../shared/constants/settings';

import {CliqueState} from '../components/CliqueState';

import './ChytPageListTable.scss';

const block = cn('chyt-page-list-table');

function useChytListColumns(cluster: string) {
    const columns: Array<Column<ChytInfo>> = React.useMemo(() => {
        return [
            {
                name: 'name',
                header: <ChytListHeader column="alias" title="CHYT clique alias" />,
                render({row}) {
                    return (
                        <div>
                            <Link
                                url={`/${cluster}/${Page.CHYT}/${row.alias}`}
                                theme="primary"
                                routed
                            >
                                {row.alias}
                            </Link>
                            <div>
                                <OperationId
                                    id={row.operation_id}
                                    cluster={cluster}
                                    color="secondary"
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                name: 'creator',
                header: <ChytListHeader column="creator" title="Owner" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            {!row.creator ? format.NO_VALUE : <UserCard userName={row.creator} />}
                        </span>
                    );
                },
            },
            {
                name: 'instance_count',
                header: <ChytListHeader column="instance_count" title="Instances" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            {row.instance_count === undefined
                                ? format.NO_VALUE
                                : format.Number(row.instance_count)}
                        </span>
                    );
                },
                align: 'right',
                width: 120,
            },
            {
                name: 'cores',
                header: <ChytListHeader column="total_cpu" title="Cores" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            {row.total_cpu === undefined
                                ? format.NO_VALUE
                                : format.Number(row.total_cpu)}
                        </span>
                    );
                },
                align: 'right',
                width: 100,
            },
            {
                name: 'memory',
                header: <ChytListHeader column="total_memory" title="Memory" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            {row.total_memory === undefined
                                ? format.NO_VALUE
                                : format.Bytes(row.total_memory)}
                        </span>
                    );
                },
                align: 'right',
                width: 120,
            },
            {
                name: 'State',
                header: <ChytListHeader column="state" title="State" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            <CliqueState state={row.state} />
                        </span>
                    );
                },
                width: 100,
            },
            {
                name: 'creation_time',
                header: (
                    <ChytListHeader column="creation_time" title="Creation time" withUndefined />
                ),
                render({row}) {
                    const {creation_time} = row;
                    return (
                        <span className={block('one-row-cell')}>
                            {creation_time ? format.DateTime(creation_time) : format.NO_VALUE}
                        </span>
                    );
                },
                width: 180,
            },
            {
                name: 'duration',
                header: <ChytListHeader column="duration" title="Duration" withUndefined />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            {!row.start_time ? format.NO_VALUE : format.TimeDuration(row.duration)}
                        </span>
                    );
                },
                align: 'right',
                width: 140,
            },
            {
                name: 'actions',
                header: '',
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            <ChytCliqueActions alias={row.alias} />
                        </span>
                    );
                },
                align: 'center',
                width: 60,
            },
        ];
    }, [cluster]);

    return columns;
}

function ChytListHeader({
    column,
    title,
    withUndefined,
}: {
    column: keyof ChytInfo;
    title: string;
    withUndefined?: boolean;
}) {
    const dispatch = useDispatch();
    const sortState = useSelector(getChytListTableSortStateByName);
    return (
        <ColumnHeader<typeof column>
            allowUnordered
            withUndefined={withUndefined}
            column={column}
            title={title}
            sortable
            {...sortState[column]}
            toggleSort={(col, nextOrder, options) => {
                dispatch(chytToggleSortState(col, nextOrder, options));
            }}
        />
    );
}

function ChytCliqueActions({alias}: {alias: string}) {
    const dispatch = useDispatch();

    const menuItems: Array<Array<DropdownMenuItem>> = [
        [
            {
                icon: <Icon awesome="play-circle" />,
                text: 'Start',
                action: () => {
                    dispatch(chytListAction('start', {alias}));
                },
            },
            {
                icon: <Icon awesome="stop-circle" />,
                text: 'Stop',
                action: () => {
                    dispatch(chytListAction('stop', {alias}));
                },
            },
        ],
        [
            {
                icon: <Icon awesome="trash-alt" />,
                text: 'Remove',
                action: () => {
                    dispatch(chytListAction('remove', {alias}));
                },
            },
        ],
    ];

    return (
        <DropdownMenu
            switcher={
                <Button view="flat">
                    <Icon awesome="ellipsis-h" />
                </Button>
            }
            items={menuItems}
        />
    );
}

function ChytPageListTable() {
    const items = useSelector(getChytListTableItems);
    const cluster = useSelector(getCluster);

    const columns = useChytListColumns(cluster);

    return (
        <DataTableYT
            className={block()}
            settings={DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR}
            useThemeYT
            columns={columns}
            data={items}
        />
    );
}

export default React.memo(ChytPageListTable);
