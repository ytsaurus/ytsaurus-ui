import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Column} from '@gravity-ui/react-data-table';

import format from '../../../common/hammer/format';

import DataTableYT, {
    DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR,
} from '../../../components/DataTableYT/DataTableYT';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';
import {OperationId} from '../../../components/OperationId/OperationId';
import {SubjectCard} from '../../../components/SubjectLink/SubjectLink';
import {Secondary} from '../../../components/Text/Text';
import Label from '../../../components/Label/Label';
import {Tooltip} from '../../../components/Tooltip/Tooltip';

import {chytToggleSortState} from '../../../store/actions/chyt/list-fitlers';
import {getCluster} from '../../../store/selectors/global';
import {
    getChytListTableItems,
    getChytListTableSortStateByName,
    getChytListVisibleColumns,
} from '../../../store/selectors/chyt';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {Page} from '../../../../shared/constants/settings';
import {CHYT_TABLE_TITLES} from '../../../constants/chyt-page';
import {OperationPool} from '../../../components/OperationPool/OperationPool';
import {useQueryWidgetSidePanel} from '../../../pages/query-tracker/QueryWidget/side-panel';

import {CliqueState} from '../components/CliqueState';

import {ChytCliqueActions, useCliqueOnSqlAction} from '../ChytCliqueActions/ChytCliqueActions';
import './ChytPageListTable.scss';

const block = cn('chyt-page-list-table');

function useChytListColumns(cluster: string, onSqlClick: (alias: string) => void) {
    const checkedColumns = useSelector(getChytListVisibleColumns);

    const columns: Array<Column<ChytInfo>> = React.useMemo(() => {
        const columnsByName = {
            pool: {
                name: 'pool',
                header: <ChytListHeader column="pool" />,
                render({row}) {
                    return !row.pool ? (
                        format.NO_VALUE
                    ) : (
                        <OperationPool
                            className={block('pool')}
                            cluster={cluster}
                            pool={{pool: row.pool, tree: 'physical'}}
                        />
                    );
                },
                width: 320,
            } as Column<ChytInfo>,
            instance_count: {
                name: 'instance_count',
                header: <ChytListHeader column="instance_count" />,
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
                header: <ChytListHeader column="total_cpu" />,
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
                header: <ChytListHeader column="total_memory" />,
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
                        <Tooltip
                            className={block('health', block('one-row-cell'))}
                            content={format.ReadableField(row.health_reason)}
                        >
                            <CliqueState state={row.health} />
                            {row.health_reason && (
                                <Secondary>
                                    &nbsp;
                                    <Icon
                                        className={block('warn-icon')}
                                        awesome={'exclamation-triangle'}
                                    />
                                </Secondary>
                            )}
                        </Tooltip>
                    );
                },
                width: 120,
            } as Column<ChytInfo>,
            creation_time: {
                name: 'creation_time',
                header: <ChytListHeader column="creation_time" withUndefined />,
                render({row}) {
                    return <DateTimeCell value={row.creation_time} />;
                },
                width: 120,
            } as Column<ChytInfo>,
            speclet_modification_time: {
                name: 'speclet_modification_time',
                header: <ChytListHeader column="speclet_modification_time" />,
                render({row}) {
                    return <DateTimeCell value={row.speclet_modification_time} />;
                },
                width: 120,
            } as Column<ChytInfo>,
            stage: {
                name: 'stage',
                header: <ChytListHeader column="stage" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>{<Label text={row.stage} />}</span>
                    );
                },
                width: 120,
            } as Column<ChytInfo>,
            strawberry_state_modification_time: {
                name: 'strawberry_state_modification_time',
                header: <ChytListHeader column="strawberry_state_modification_time" />,
                render({row}) {
                    return <DateTimeCell value={row.strawberry_state_modification_time} />;
                },
                width: 120,
            } as Column<ChytInfo>,
            yt_operation_finish_time: {
                name: 'yt_operation_finish_time',
                header: <ChytListHeader column="yt_operation_finish_time" withUndefined />,
                render({row}) {
                    return <DateTimeCell value={row.yt_operation_finish_time} />;
                },
                width: 120,
            } as Column<ChytInfo>,
            yt_operation_start_time: {
                name: 'yt_operation_start_time',
                header: <ChytListHeader column="yt_operation_start_time" withUndefined />,
                render({row}) {
                    return <DateTimeCell value={row.yt_operation_start_time} />;
                },
                width: 120,
            } as Column<ChytInfo>,
            creator: {
                name: 'creator',
                header: <ChytListHeader column="creator" />,
                render({row}) {
                    return (
                        <div className={block('one-row-cell', block('creator'))}>
                            {!row.creator ? (
                                format.NO_VALUE
                            ) : (
                                <SubjectCard className={block('full-width')} name={row.creator} />
                            )}
                        </div>
                    );
                },
                width: 120,
            } as Column<ChytInfo>,
            state: {
                name: 'state',
                header: <ChytListHeader column="state" />,
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            <CliqueState state={row.state} />
                        </span>
                    );
                },
                width: 120,
            } as Column<ChytInfo>,
        };

        const res = checkedColumns.map((i) => columnsByName[i]);
        return [
            {
                name: 'alias',
                header: <ChytListHeader column="alias" />,
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
                            <ClipboardButton
                                text={row.alias}
                                view="clear"
                                visibleOnRowHover
                                inlineMargins
                            />
                            <div>
                                <OperationId
                                    id={row.yt_operation_id}
                                    cluster={cluster}
                                    color="secondary"
                                    allowCopy
                                />
                            </div>
                        </div>
                    );
                },
            } as Column<ChytInfo>,
            ...res,
            {
                name: 'actions',
                header: '',
                render({row}) {
                    return (
                        <span className={block('one-row-cell')}>
                            <ChytCliqueActions
                                alias={row.alias}
                                pool={row.pool}
                                onSqlClick={onSqlClick}
                                color="secondary"
                            />
                        </span>
                    );
                },
                align: 'center',
                width: 60,
            } as Column<ChytInfo>,
        ];
    }, [cluster, checkedColumns, onSqlClick]);

    return columns;
}

function ChytListHeader({
    column,
    withUndefined,
}: {
    column: keyof ChytInfo;
    withUndefined?: boolean;
}) {
    const dispatch = useDispatch();
    const sortState = useSelector(getChytListTableSortStateByName);
    return (
        <ColumnHeader<typeof column>
            allowUnordered
            withUndefined={withUndefined}
            column={column}
            title={CHYT_TABLE_TITLES[column] ?? format.ReadableField(column)}
            sortable
            {...sortState[column]}
            toggleSort={(col, nextOrder, options) => {
                dispatch(chytToggleSortState(col, nextOrder, options));
            }}
        />
    );
}

function DateTimeCell({value}: {value?: string}) {
    if (!value) {
        return <span className={block('one-row-cell')}>{format.NO_VALUE}</span>;
    }

    const time: string = format.DateTime(value);
    const lastSpace = time.lastIndexOf(' ');
    return (
        <React.Fragment>
            <span>{time.substring(0, lastSpace)}</span>
            <div>{time.substring(lastSpace + 1)}</div>
        </React.Fragment>
    );
}

function ChytPageListTable() {
    const items = useSelector(getChytListTableItems);
    const cluster = useSelector(getCluster);

    const {openWidget, widgetContent} = useQueryWidgetSidePanel();
    const onSqlClick = useCliqueOnSqlAction(openWidget);

    const columns = useChytListColumns(cluster, onSqlClick);

    return (
        <React.Fragment>
            <DataTableYT
                className={block()}
                settings={DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR}
                useThemeYT
                columns={columns}
                data={items}
            />
            {widgetContent}
        </React.Fragment>
    );
}

export default React.memo(ChytPageListTable);
