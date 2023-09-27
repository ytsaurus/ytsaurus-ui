import React from 'react';
import DataTable, {Column} from '@gravity-ui/react-data-table';
import {Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import './NodeJobs.scss';

const block = cn('node-jobs');

interface NodeJobsProps {
    completed?: number;
    running?: number;
    failed?: number;
    aborted?: number;
    total?: number;
}

type JobRow = {status: string; count: number};

const jobsColumns: Column<JobRow>[] = [
    {
        name: 'status',
        header: 'Status',
        sortable: false,
        render({row, footer}) {
            return (
                <div className={block('item')}>
                    <div className={block('item-color', {status: row.status.toLowerCase()})} />
                    <Text
                        className={block('item-title')}
                        color={footer ? 'primary' : 'secondary'}
                        // weight={footer ? 'medium' : 'regular'}
                    >
                        {row.status}
                    </Text>
                </div>
            );
        },
    },
    {name: 'count', header: 'Quantity', align: DataTable.RIGHT, sortable: false},
];

export default function NodeJobs({
    running = 0,
    completed = 0,
    failed = 0,
    aborted = 0,
    total = 0,
}: NodeJobsProps) {
    const statuses: JobRow[] = [];
    statuses.push({status: 'Pending', count: total - running - completed - failed - aborted});
    statuses.push({status: 'Running', count: running});
    statuses.push({status: 'Completed', count: completed});
    statuses.push({status: 'Failed', count: failed});
    statuses.push({status: 'Aborted', count: aborted});
    return (
        <div className={block()}>
            <DataTable
                theme="yandex-cloud"
                columns={jobsColumns}
                data={statuses}
                footerData={[
                    {
                        status: 'Total',
                        count: total,
                    },
                ]}
                settings={{displayIndices: false}}
            />
        </div>
    );
}
