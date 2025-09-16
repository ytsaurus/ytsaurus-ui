import {http} from 'msw';
import {ViewOperationLogsResponse} from '../../../../../../store/api/operations/operaion-detail/logs/view';
import {ListOperationLogsResponse} from '../../../../../../store/api/operations/operaion-detail/logs/list';

const operationLogsView: ViewOperationLogsResponse = [
    {
        log_name: 'stderr',
        file_path: '/var/log/yt/job-proxy/stderr.log',
        raw_ts: 1694520000000,
        formatted_ts: '12.09 10:00:00.000',
        content: 'ERROR: Failed to connect to database',
        log_group: 'database',
    },
    {
        log_name: 'stdout',
        file_path: '/var/log/yt/job-proxy/stdout.log',
        raw_ts: 1694520060000,
        formatted_ts: '12.09 10:01:00.000',
        content: 'INFO: Processing batch 1 of 100',
        log_group: 'processing',
    },
    {
        log_name: 'stderr',
        file_path: '/var/log/yt/job-proxy/stderr.log',
        raw_ts: 1694520120000,
        formatted_ts: '12.09 10:02:00.000',
        content: 'WARN: Memory usage is high (85%)',
        log_group: 'system',
    },
    {
        log_name: 'stdout',
        file_path: '/var/log/yt/job-proxy/stdout.log',
        raw_ts: 1694520180000,
        formatted_ts: '12.09 10:03:00.000',
        content: 'INFO: Successfully processed 1000 records',
        log_group: 'processing',
    },
    {
        log_name: 'debug',
        file_path: '/var/log/yt/job-proxy/debug.log',
        raw_ts: 1694520240000,
        formatted_ts: '12.09 10:04:00.000',
        content: 'DEBUG: Connection pool size: 10, active: 3',
        log_group: 'database',
    },
];

const operationLogsList: ListOperationLogsResponse = [
    {
        group_info: {
            name: 'job-proxy',
            jobs_filter: {
                task_name: 'main_task',
                job_cookie: 12345,
            },
        },
        log_level_groups: [
            {
                log_level: 'ERROR' as const,
                logs: [
                    {
                        name: 'stderr',
                        file_paths: ['/var/log/yt/job-proxy/stderr.log'],
                    },
                    {
                        name: 'error',
                        file_paths: ['/var/log/yt/job-proxy/error.log'],
                    },
                ],
            },
            {
                log_level: 'INFO',
                logs: [
                    {
                        name: 'stdout',
                        file_paths: ['/var/log/yt/job-proxy/stdout.log'],
                    },
                    {
                        name: 'info',
                        file_paths: ['/var/log/yt/job-proxy/info.log'],
                    },
                ],
            },
            {
                log_level: 'DEBUG',
                logs: [
                    {
                        name: 'debug',
                        file_paths: ['/var/log/yt/job-proxy/debug.log'],
                    },
                ],
            },
        ],
    },
    {
        group_info: {
            name: 'scheduler',
            jobs_filter: {
                task_name: 'scheduler_task',
                job_cookie: 67890,
            },
        },
        log_level_groups: [
            {
                log_level: 'ERROR' as const,
                logs: [
                    {
                        name: 'stderr',
                        file_paths: ['/var/log/yt/scheduler/stderr.log'],
                    },
                ],
            },
            {
                log_level: 'INFO',
                logs: [
                    {
                        name: 'stdout',
                        file_paths: ['/var/log/yt/scheduler/stdout.log'],
                    },
                    {
                        name: 'access',
                        file_paths: ['/var/log/yt/scheduler/access.log'],
                    },
                ],
            },
            {
                log_level: 'DEBUG',
                logs: [
                    {
                        name: 'debug',
                        file_paths: ['/var/log/yt/scheduler/debug.log'],
                    },
                    {
                        name: 'trace',
                        file_paths: ['/var/log/yt/scheduler/trace.log'],
                    },
                ],
            },
        ],
    },
];

export const operationLogsListHandler = http.post('/api/logs/operation/list/123', () => {
    return Response.json(operationLogsList);
});

export const operationLogsViewHandler = http.post('/api/logs/operation/view/123', () => {
    return Response.json(operationLogsView);
});
