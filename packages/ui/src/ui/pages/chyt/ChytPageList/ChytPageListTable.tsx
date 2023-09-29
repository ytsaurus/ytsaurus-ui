import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Column} from '@gravity-ui/react-data-table';

import format from '../../../common/hammer/format';

import DataTableYT, {
    DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR,
} from '../../../components/DataTableYT/DataTableYT';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import Icon from '../../../components/Icon/Icon';
import Label from '../../../components/Label/Label';

import {chytToggleSortState} from '../../../store/actions/chyt/list-fitlers';
import {
    getChytListTableItems,
    getChytListTableSortStateByName,
} from '../../../store/selectors/chyt';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {Button, DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';
import {chytCliqueAction} from '../../../store/actions/chyt/list';

const THEME_MAP = {
    active: 'success',
    broken: 'danger',
} as const;

function useChytListColumns() {
    const columns: Array<Column<ChytInfo>> = React.useMemo(() => {
        return [
            {
                name: 'name',
                header: <ChytListHeader column="alias" title="CHYT clique alias" />,
                render({row}) {
                    return row.alias;
                },
            },
            {
                name: 'creator',
                header: <ChytListHeader column="creator" title="Owner" />,
                render({row}) {
                    return row.creator === undefined ? format.NO_VALUE : row.creator;
                },
            },
            {
                name: 'instance_count',
                header: <ChytListHeader column="instance_count" title="Instances" />,
                render({row}) {
                    return row.instance_count === undefined
                        ? format.NO_VALUE
                        : format.Number(row.instance_count);
                },
                align: 'right',
                width: 120,
            },
            {
                name: 'cores',
                header: <ChytListHeader column="total_cpu" title="Cores" />,
                render({row}) {
                    return row.total_cpu === undefined
                        ? format.NO_VALUE
                        : format.Number(row.total_cpu);
                },
                align: 'right',
                width: 100,
            },
            {
                name: 'memory',
                header: <ChytListHeader column="total_memory" title="Memory" />,
                render({row}) {
                    return row.total_memory === undefined
                        ? format.NO_VALUE
                        : format.Bytes(row.total_memory);
                },
                align: 'right',
                width: 120,
            },
            {
                name: 'State',
                header: <ChytListHeader column="state" title="State" />,
                render({row}) {
                    return !row.state ? (
                        format.NO_VALUE
                    ) : (
                        <Label text={row.state} theme={THEME_MAP[row.state]} capitalize />
                    );
                },
                width: 100,
            },
            {
                name: 'duration',
                header: <ChytListHeader column="duration" title="Duration" withUndefined />,
                render({row}) {
                    return !row.start_time ? format.NO_VALUE : format.TimeDuration(row.duration);
                },
                align: 'right',
                width: 140,
            },
            {
                name: 'actions',
                header: '',
                render({row}) {
                    return <ChytCliqueActions alias={row.alias} />;
                },
                align: 'center',
                width: 60,
            },
        ];
    }, []);

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
                    dispatch(chytCliqueAction('start', alias));
                },
            },
            {
                icon: <Icon awesome="stop-circle" />,
                text: 'Stop',
                action: () => {
                    dispatch(chytCliqueAction('stop', alias));
                },
            },
        ],
        [
            {
                icon: <Icon awesome="trash-alt" />,
                text: 'Remove',
                action: () => {
                    dispatch(chytCliqueAction('remove', alias));
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

    const columns = useChytListColumns();

    return (
        <DataTableYT
            settings={DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR}
            useThemeYT
            columns={columns}
            data={items}
        />
    );
}

export default React.memo(ChytPageListTable);
