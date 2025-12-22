import cn from 'bem-cn-lite';
import moment from 'moment';
import React from 'react';

import {Route, Switch, useRouteMatch} from 'react-router';
import {FlowWorkerData} from '../../../../../shared/yt-types';
import format from '../../../../common/hammer/format';
import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import {
    DataTableGravity,
    SortIndicator,
    TableCell,
    tanstack,
    useTable,
} from '../../../../components/DataTableGravity';
import {YTErrorBlock} from '../../../../components/Error/Error';
import Link from '../../../../components/Link/Link';
import {NoWrap} from '../../../../components/Text/Text';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {formatTimeDuration} from '../../../../components/TimeDuration/TimeDuration';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {FlowNodeStatus} from '../../../../pages/flow/Flow/FlowGraph/renderers/FlowGraphRenderer';
import {FlowWorker} from '../../../../pages/flow/Flow/FlowWorker/FlowWorker';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {FlowTab} from '../../../../store/reducers/flow/filters';
import {useFlowWorkersNameFilter} from '../../../../store/reducers/flow/filters.hooks';
import {useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../../utils/app-url';
import './FlowWorkers.scss';
import i18n from './i18n';

const block = cn('yt-flow-workers');

export function FlowWorkers({pipeline_path}: {pipeline_path: string}) {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/worker/:worker`} component={FlowWorker} />
            <Route
                exact
                path={`${path}`}
                render={() => <FlowWorkersList pipeline_path={pipeline_path} />}
            />
        </Switch>
    );
}

function FlowWorkersList({pipeline_path}: {pipeline_path: string}) {
    const {setWorkersNameFilter, workdersNameFilter} = useFlowWorkersNameFilter();
    return (
        <WithStickyToolbar
            toolbar={
                <Toolbar
                    itemsToWrap={[
                        {
                            node: (
                                <TextInputWithDebounce
                                    className={block('name-filter')}
                                    placeholder={i18n('search_placeholder')}
                                    value={workdersNameFilter}
                                    onUpdate={setWorkersNameFilter}
                                />
                            ),
                        },
                    ]}
                />
            }
            content={<FlowWorkersTable pipeline_path={pipeline_path} />}
        />
    );
}

function FlowWorkersTable({pipeline_path}: {pipeline_path: string}) {
    const {columns} = useFlowWorkersColumns();

    const {error, items} = useFlowWorkerssTableData(pipeline_path);

    const [sorting, setSorting] = React.useState<tanstack.SortingState>([]);

    const table = useTable({
        columns,
        data: items ?? [],
        enableColumnPinning: true,
        enableColumnResizing: true,
        state: {
            columnPinning: {
                left: ['address'],
                right: ['actions'],
            },
            sorting,
        },
        onSortingChange: setSorting,
        enableSorting: true,
    });

    return (
        <div className={block()}>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <DataTableGravity
                table={table}
                virtualized
                rowHeight={40}
                renderSortIndicator={(props) => {
                    return <SortIndicator {...props} />;
                }}
            />
        </div>
    );
}

function useFlowWorkerssTableData(pipeline_path: string) {
    const res = useFlowExecuteQuery<'describe-workers'>({
        parameters: {
            flow_command: 'describe-workers',
            pipeline_path,
        },
    });
    const {workdersNameFilter} = useFlowWorkersNameFilter();

    return {
        ...res,
        items: React.useMemo(() => {
            const filterLower = workdersNameFilter.toLowerCase();
            const items = res.data?.workers?.filter((item) => {
                return -1 !== item.address.toLowerCase().indexOf(filterLower);
            });
            return items;
        }, [res.data?.workers, workdersNameFilter]),
    };
}

type FlowWorkersColumnDef = tanstack.ColumnDef<FlowWorkerData>;

function useFlowWorkersColumns() {
    const res = React.useMemo(() => {
        const columns: Array<FlowWorkersColumnDef> = [
            {
                id: 'address',
                header: () => i18n('address'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <NoWrap>
                                <FlowWorkerAddress item={item} />
                            </NoWrap>
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
                accessorFn(d) {
                    return d.address;
                },
            },
            {
                id: 'uptime',
                header: () => i18n('uptime'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    const timestamp = moment(item.register_time).valueOf();
                    const duration = Math.round((Date.now() - timestamp) / 1000) * 1000;
                    return <TableCell>{formatTimeDuration(duration)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    const timestamp = moment(d.register_time).valueOf();
                    return Date.now() - timestamp;
                },
            },
            {
                id: 'cpu_usage',
                header: () => i18n('cpu-usage'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Number(item.cpu_usage)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.cpu_usage;
                },
            },
            {
                id: 'memory_usage',
                header: () => i18n('memory-usage'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Bytes(item.memory_usage)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.memory_usage;
                },
            },
            {
                id: 'health',
                header: () => i18n('health'),
                size: 120,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <FlowNodeStatus status={item.status} />
                        </TableCell>
                    );
                },
                accessorFn(d) {
                    return d.status;
                },
            },
            {
                id: 'actions',
                header: () => null,
                size: 50,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ClickableAttributesButton title={item.address} attributes={item} />
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
            },
        ];

        return {columns};
    }, []);
    return res;
}

function FlowWorkerAddress({item}: {item: FlowWorkerData}) {
    const path = useSelector(getFlowPipelinePath);
    return (
        <Link
            url={makeFlowLink({path, tab: FlowTab.WORKERS, worker: item.incarnation_id})}
            routed
            routedPreserveLocation
        >
            {item.address}
        </Link>
    );
}
