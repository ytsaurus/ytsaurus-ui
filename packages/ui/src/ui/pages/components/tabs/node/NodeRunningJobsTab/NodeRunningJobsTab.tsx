import React from 'react';
import {useParams} from 'react-router';
import {type Column} from '@gravity-ui/react-data-table';
import {Button} from '@gravity-ui/uikit';

import {DATA_TABLE_YT_SETTINGS, DataTableYT} from '../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {RoutedLink} from '../../../../../containers/RoutedLink/RoutedLink';
import hammer from '../../../../../common/hammer';
import {makeOperationJobUrl} from '../../../../../utils/app-url/makeOperationJobUrl';
import Loader from '../../../../../components/Loader/Loader';
import {selectCluster} from '../../../../../store/selectors/global';
import {useSelector} from '../../../../../store/redux-hooks';

import type {RunningJob} from '../../../../../store/actions/components/node/running-jobs';
import {useNodeRunningJobs} from './useNodeRunningJobs';
import i18n from './i18n';

function getMemoryValue(demand: RunningJob['initial_resource_demand']): number {
    if (!demand) {
        return 0;
    }
    if (demand.system_memory !== undefined || demand.user_memory !== undefined) {
        return (demand.system_memory || 0) + (demand.user_memory || 0);
    }
    return demand.memory ?? 0;
}

const getColumns = (cluster: string): Array<Column<RunningJob>> => [
    {
        name: 'job_id',
        header: i18n('field_job-id'),
        sortable: true,
        sortAccessor: (row) => row.job_id,
        render({row}) {
            const url = makeOperationJobUrl({
                cluster,
                operationId: row.operation_id,
                jobId: row.job_id,
            });
            return (
                <RoutedLink href={url} disablePreserveLocation>
                    {row.job_id}
                </RoutedLink>
            );
        },
        align: 'left',
    },
    {
        name: 'operation_id',
        header: i18n('field_operation-id'),
        sortable: true,
        sortAccessor: (row) => row.operation_id,
        render({row}) {
            const url = `/${cluster}/operations/${row.operation_id}`;
            return (
                <RoutedLink href={url} disablePreserveLocation>
                    {row.operation_id}
                </RoutedLink>
            );
        },
        align: 'left',
    },
    {
        name: 'job_type',
        header: i18n('field_job-type'),
        sortable: true,
        sortAccessor: (row) => row.job_type,
        render({row}) {
            return row.job_type
                ? hammer.format['ReadableField'](row.job_type)
                : hammer.format.NO_VALUE;
        },
        align: 'left',
    },
    {
        name: 'job_phase',
        header: i18n('field_job-phase'),
        sortable: true,
        sortAccessor: (row) => row.job_phase,
        render({row}) {
            return row.job_phase
                ? hammer.format['ReadableField'](row.job_phase)
                : hammer.format.NO_VALUE;
        },
        align: 'left',
    },
    {
        name: 'start_time',
        header: i18n('field_start-time'),
        sortable: true,
        sortAccessor: (row) => row.start_time,
        render({row}) {
            return row.start_time
                ? hammer.format['DateTime'](row.start_time)
                : hammer.format.NO_VALUE;
        },
        align: 'left',
    },
    {
        name: 'vcpu',
        header: i18n('field_vcpu'),
        sortable: true,
        sortAccessor: (row) => row.initial_resource_demand?.vcpu ?? 0,
        render({row}) {
            return row.initial_resource_demand?.vcpu !== undefined
                ? hammer.format['Number'](row.initial_resource_demand.vcpu)
                : hammer.format.NO_VALUE;
        },
        align: 'right',
    },
    {
        name: 'memory',
        header: i18n('field_memory'),
        sortable: true,
        sortAccessor: (row) => getMemoryValue(row.initial_resource_demand),
        render({row}) {
            const memoryValue = getMemoryValue(row.initial_resource_demand);
            return memoryValue !== undefined && memoryValue !== 0
                ? hammer.format['Bytes'](memoryValue)
                : hammer.format.NO_VALUE;
        },
        align: 'right',
    },
    {
        name: 'gpu',
        header: i18n('field_gpu'),
        sortable: true,
        sortAccessor: (row) => row.initial_resource_demand?.gpu ?? 0,
        render({row}) {
            return row.initial_resource_demand?.gpu !== undefined
                ? hammer.format['Number'](row.initial_resource_demand.gpu)
                : hammer.format.NO_VALUE;
        },
        align: 'right',
    },
];

function NodeRunningJobsTab() {
    const {host} = useParams<{host: string}>();
    const cluster = useSelector(selectCluster);
    const {jobs, loading, loaded, error, errorData, refresh} = useNodeRunningJobs(host);

    const columns = React.useMemo(() => getColumns(cluster), [cluster]);

    if (error) {
        return (
            <div>
                <YTErrorBlock error={errorData} />
                <Button onClick={refresh} view="normal" size="m">
                    Retry
                </Button>
            </div>
        );
    }

    if (!loaded) {
        return <Loader />;
    }

    return (
        <DataTableYT
            columns={columns}
            data={jobs}
            loaded={loaded}
            loading={loading}
            useThemeYT
            settings={{
                ...DATA_TABLE_YT_SETTINGS,
                displayIndices: false,
                sortable: true,
                externalSort: false,
            }}
            emptyDataMessage={i18n('no-running-jobs')}
        />
    );
}

export default React.memo(NodeRunningJobsTab);
