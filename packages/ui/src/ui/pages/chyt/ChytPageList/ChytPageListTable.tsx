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
import Label from '../../../components/Label/Label';

import {chytToggleSortState} from '../../../store/actions/chyt/list-fitlers';
import {getCluster} from '../../../store/selectors/global';
import {
    getChytListColumns,
    getChytListTableItems,
    getChytListTableSortStateByName,
} from '../../../store/selectors/chyt';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {chytListAction} from '../../../store/actions/chyt/list';
import {Page} from '../../../../shared/constants/settings';
import {showErrorPopup} from '../../../utils/utils';

import {CliqueState} from '../components/CliqueState';

import './ChytPageListTable.scss';

const block = cn('chyt-page-list-table');

function useChytListColumns(cluster: string) {
    const checkedColumns = useSelector(getChytListColumns).filter((i) => i.checked);

    const columns: Array<Column<ChytInfo>> = React.useMemo(() => {
        const columnsByName = {
            instance_count: {
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
            } as Column<ChytInfo>,
            total_cpu: {
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
            } as Column<ChytInfo>,
            total_memory: {
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
            } as Column<ChytInfo>,
            health: {
                name: 'health',
                header: <ChytListHeader column="health" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            <CliqueState state={row.health} />
                        </span>
                    );
                },
                align: 'center',
                width: 100,
            } as Column<ChytInfo>,
            creation_time: {
                name: 'creation_time',
                header: <ChytListHeader column="creation_time" withUndefined />,
                render({row}) {
                    const {creation_time} = row;
                    return (
                        <span className={block('one-row-cell')}>
                            {creation_time ? format.DateTime(creation_time) : format.NO_VALUE}
                        </span>
                    );
                },
                width: 180,
            } as Column<ChytInfo>,
            speclet_modification_time: {
                name: 'speclet_modification_time',
                header: (
                    <ChytListHeader column="speclet_modification_time" title="Modification time" />
                ),
                render({row}) {
                    const {speclet_modification_time: value} = row;
                    return (
                        <span className={block('one-row-cell')}>
                            {value ? format.DateTime(value) : format.NO_VALUE}
                        </span>
                    );
                },
            } as Column<ChytInfo>,
            stage: {
                name: 'stage',
                header: <ChytListHeader column="stage" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>{<Label text={row.stage} />}</span>
                    );
                },
            } as Column<ChytInfo>,
            strawberry_state_modification_time: {
                name: 'strawberry_state_modification_time',
                header: (
                    <ChytListHeader
                        column="strawberry_state_modification_time"
                        title="Strawberrry modification time"
                    />
                ),
                render({row}) {
                    const {strawberry_state_modification_time: value} = row;
                    return (
                        <span className={block('one-row-cell')}>
                            {value ? format.DateTime(value) : format.NO_VALUE}
                        </span>
                    );
                },
            } as Column<ChytInfo>,
            yt_operation_finish_time: {
                name: 'yt_operation_finish_time',
                header: (
                    <ChytListHeader
                        column="yt_operation_finish_time"
                        title="Finish time"
                        withUndefined
                    />
                ),
                render({row}) {
                    const {yt_operation_finish_time: value} = row;
                    return (
                        <span className={block('one-row-cell')}>
                            {value ? format.DateTime(value) : format.NO_VALUE}
                        </span>
                    );
                },
                width: 180,
            } as Column<ChytInfo>,
            yt_operation_start_time: {
                name: 'yt_operation_start_time',
                header: (
                    <ChytListHeader
                        column="yt_operation_start_time"
                        title="Start time"
                        withUndefined
                    />
                ),
                render({row}) {
                    const {yt_operation_start_time: value} = row;
                    return (
                        <span className={block('one-row-cell')}>
                            {value ? format.DateTime(value) : format.NO_VALUE}
                        </span>
                    );
                },
                width: 180,
            } as Column<ChytInfo>,
        };

        const res = checkedColumns.map((i) => columnsByName[i.column]);
        return [
            {
                name: 'alias',
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
                                    id={row.yt_operation_id}
                                    cluster={cluster}
                                    color="secondary"
                                />
                            </div>
                        </div>
                    );
                },
            } as Column<ChytInfo>,
            {
                name: 'creator',
                header: <ChytListHeader column="creator" title="Creator" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            {!row.creator ? format.NO_VALUE : <UserCard userName={row.creator} />}
                        </span>
                    );
                },
            } as Column<ChytInfo>,
            {
                name: 'state',
                header: <ChytListHeader column="state" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            <CliqueState state={row.state} />
                        </span>
                    );
                },
                align: 'center',
                width: 100,
            } as Column<ChytInfo>,
            ...res,
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
            } as Column<ChytInfo>,
        ];
    }, [cluster, checkedColumns]);

    return columns;
}

function ChytListHeader({
    column,
    title,
    withUndefined,
}: {
    column: keyof ChytInfo;
    title?: string;
    withUndefined?: boolean;
}) {
    const dispatch = useDispatch();
    const sortState = useSelector(getChytListTableSortStateByName);
    return (
        <ColumnHeader<typeof column>
            allowUnordered
            withUndefined={withUndefined}
            column={column}
            title={title ?? format.ReadableField(column)}
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
        <React.Fragment>
            <Button view="flat" onClick={() => showErrorPopup(new Error('not implemented'))}>
                <Icon awesome="sql" />
            </Button>
            <DropdownMenu
                switcher={
                    <Button view="flat">
                        <Icon awesome="ellipsis-h" />
                    </Button>
                }
                items={menuItems}
            />
        </React.Fragment>
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
