import cn from 'bem-cn-lite';
import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router';
import {FlowComputationType} from '../../../../../shared/yt-types';
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
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {FlowTab} from '../../../../store/reducers/flow/filters';
import {useFlowComputationsNameFilter} from '../../../../store/reducers/flow/filters.hooks';
import {useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {getCluster} from '../../../../store/selectors/global/cluster';
import {makeFlowLink} from '../../../../utils/app-url';
import {FlowComputation} from '../FlowComputation/FlowComputation';
import {FlowNodeStatus} from '../FlowGraph/renderers/FlowGraphRenderer';
import './FlowComputations.scss';
import i18n from './i18n';

const block = cn('yt-flow-computations');

export function FlowComputations({pipeline_path}: {pipeline_path: string}) {
    const {path} = useRouteMatch();

    return (
        <Switch>
            <Route
                path={`${path}`}
                exact
                render={() => <FlowComputationsList pipeline_path={pipeline_path} />}
            />
            <Route
                path={`${path}/:computation?`}
                render={() => {
                    return <FlowComputation />;
                }}
            />
        </Switch>
    );
}

export function FlowComputationsList({pipeline_path}: {pipeline_path: string}) {
    const {computationsNameFilter, setComputationsNameFilter} = useFlowComputationsNameFilter();
    return (
        <WithStickyToolbar
            toolbar={
                <Toolbar
                    itemsToWrap={[
                        {
                            node: (
                                <TextInputWithDebounce
                                    className={block('name-filter')}
                                    placeholder={i18n('search-by-name')}
                                    value={computationsNameFilter}
                                    onUpdate={setComputationsNameFilter}
                                />
                            ),
                        },
                    ]}
                />
            }
            content={<FlowComputationsTable pipeline_path={pipeline_path} />}
        />
    );
}

function FlowComputationsTable({pipeline_path}: {pipeline_path: string}) {
    const {columns} = useFlowComputationsColumn();

    const {error, items} = useFlowComputationsTableData(pipeline_path);

    const [sorting, setSorting] = React.useState<tanstack.SortingState>([]);

    const table = useTable({
        columns,
        data: items ?? [],
        enableColumnPinning: true,
        enableColumnResizing: true,
        state: {
            columnPinning: {
                left: ['name'],
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

function useFlowComputationsTableData(pipeline_path: string) {
    const cluster = useSelector(getCluster);
    const res = useFlowExecuteQuery<'describe-computations'>({
        cluster,
        parameters: {
            flow_command: 'describe-computations',
            pipeline_path,
        },
    });
    const {computationsNameFilter} = useFlowComputationsNameFilter();

    return {
        ...res,
        items: React.useMemo(() => {
            const filterLower = computationsNameFilter.toLowerCase();
            const items = res.data?.computations?.filter(({name}) => {
                return -1 !== name.toLowerCase().indexOf(filterLower);
            });
            return items;
        }, [res.data?.computations, computationsNameFilter]),
    };
}

type FlowComputationsColumnDef = tanstack.ColumnDef<FlowComputationType>;

function useFlowComputationsColumn() {
    const path = useSelector(getFlowPipelinePath);
    const res = React.useMemo(() => {
        const columns: Array<FlowComputationsColumnDef> = [
            {
                id: 'name',
                header: () => i18n('name'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <Link
                                url={makeFlowLink({
                                    path,
                                    tab: FlowTab.COMPUTATIONS,
                                    computation: item.name,
                                })}
                                routed
                                routedPreserveLocation
                            >
                                {item.name}
                            </Link>
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
                accessorFn(d) {
                    return d.name;
                },
            },
            {
                id: 'class',
                header: () => i18n('class'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{item.class_name}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.class_name;
                },
            },
            {
                id: 'partition_count',
                header: () => i18n('partitions-count'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Number(item.partitions_stats?.count)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.partitions_stats?.count;
                },
            },
            {
                id: 'cpu_usage',
                header: () => i18n('cpu-usage'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Number(item.metrics.cpu_usage_10m)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.metrics.cpu_usage_10m;
                },
            },
            {
                id: 'memory_usage',
                header: () => i18n('memory-usage'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Bytes(item.metrics.memory_usage_10m)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.metrics.memory_usage_10m;
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
                            <ClickableAttributesButton title={item.name} attributes={item} />
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
            },
        ];

        return {columns};
    }, [path]);
    return res;
}
