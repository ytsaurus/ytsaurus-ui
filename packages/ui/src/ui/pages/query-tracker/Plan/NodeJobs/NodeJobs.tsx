import React from 'react';
import DataTable, {Column} from '@gravity-ui/react-data-table';
import {Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import '../NodeJobs.scss';
import i18n from './i18n';

const block = cn('node-jobs');

interface NodeJobsProps {
    completed?: number;
    running?: number;
    failed?: number;
    aborted?: number;
    total?: number;
}

type JobRow = {status: string; count: number};

const getJobsColumns = (): Column<JobRow>[] => [
    {
        name: 'status',
        header: i18n('field_status'),
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
    {name: 'count', header: i18n('field_quantity'), align: DataTable.RIGHT, sortable: false},
];

export default function NodeJobs({
    running = 0,
    completed = 0,
    failed = 0,
    aborted = 0,
    total = 0,
}: NodeJobsProps) {
    const statuses: JobRow[] = [];
    statuses.push({
        status: i18n('value_pending'),
        count: total - running - completed - failed - aborted,
    });
    statuses.push({status: i18n('value_running'), count: running});
    statuses.push({status: i18n('value_completed'), count: completed});
    statuses.push({status: i18n('value_failed'), count: failed});
    statuses.push({status: i18n('value_aborted'), count: aborted});
    return (
        <div className={block()}>
            <DataTable
                theme="yandex-cloud"
                columns={getJobsColumns()}
                data={statuses}
                footerData={[
                    {
                        status: i18n('value_total'),
                        count: total,
                    },
                ]}
                settings={{displayIndices: false}}
            />
        </div>
    );
}
