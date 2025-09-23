import React, {useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router';
import {ELogsPanelLevel, LogsPanel, TLogsPanelProps} from '@yandex-data-ui/dynamic-logs-viewer';

import {
    useJobLogsListQuery,
    useJobLogsViewQuery,
} from '../../../../store/api/job/logs';
import {ViewJobLogsArgs} from '../../../../store/api/job/logs/view';
import {getOperation} from '../../../../store/selectors/operations/operation';
import {getCluster} from '../../../../store/selectors/global';
import {LogMeta} from '../../../../types/operations/logs';
import {RouteInfo} from '../../Job';

export function JobLogs() {
    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    const match = useRouteMatch<RouteInfo>();

    const jobParams = {
        cluster,
        operationId: operation.id,
        jobId: match.params.jobID,
    };

    const {data: logsListResponse, isLoading: isListLoading} =
        useJobLogsListQuery(jobParams);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<TLogsPanelProps['timeRange']>(null);
    const [paginationOptions, setPaginationOptions] = useState<
        ViewJobLogsArgs['pagination_options']
    >({pagination_directions: 'BACKWARD', page_size: 1});
    const [settings, setSettings] = useState({
        wrapLines: true,
        renderLinks: true,
        caseInsensitiveSearch: true,
    });

    const logsPanelRef = useRef(null);

    const {
        data: logsView,
        isLoading: isViewLoading,
        refetch,
    } = useJobLogsViewQuery({
        ...jobParams,
        substring_filter: {
            substring: searchQuery,
            is_substring_case_sensetive: false,
        },
        logs_filter:
            logsListResponse?.raw?.map?.((group) => 
                ({log_name: 'abc', file_paths: ['asd'], log_meta: {log_level: 'ERROR' as const}}),
            ) ?? [],
        pagination_options: paginationOptions,
        time_range_filter: {
            ts_from: String(timeRange?.start?.value),
            ts_to: String(timeRange?.end?.value),
        },
    });

    const loadLogsAbove = async () => {
        if (!logsView?.length) {
            return;
        }

        const lastLog = logsView.findLast((item) => 'meta' in item);

        if (!lastLog) {
            return;
        }
        setPaginationOptions({pagination_directions: 'BACKWARD', page_size: 5});
        refetch();
    };

    const loadLogsBelow = async () => {
        console.log('below');
        if (!logsView?.length) {
            return;
        }

        const lastLog = logsView.findLast((item) => 'meta' in item);

        if (!lastLog) {
            return;
        }
        setPaginationOptions({pagination_directions: 'FORWARD', page_size: 5});
        refetch();
    };

    const loadLogsFromTail = async () => {
        console.log('tail');
        if (!logsView?.length) {
            return;
        }

        const lastLog = logsView.findLast((item) => 'meta' in item);

        if (!lastLog) {
            return;
        }

        setPaginationOptions({pagination_directions: 'FORWARD', page_size: 5});
        logsPanelRef.current?.scrollToItem(logsView.length - 1, 'end');
        refetch();
    };

    const loadLogsFromHead = async () => {
        console.log('head');
        if (!logsView?.length) {
            return;
        }

        const lastLog = logsView.findLast((item) => 'meta' in item);

        if (!lastLog) {
            return;
        }

        setPaginationOptions({pagination_directions: 'BACKWARD', page_size: 5});
        logsPanelRef.current?.scrollToItem(0, 'end');
        refetch();
    };

    return (
        <LogsPanel<LogMeta>
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            settings={settings}
            ref={logsPanelRef}
            onSettingsChange={setSettings}
            logsSelectorOptions={logsListResponse?.options ?? []}
            logsSelectorSelectedIds={selectedLogIds}
            onLogsSelectorSelectedIdsChange={setSelectedLogIds}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            loading={isViewLoading || isListLoading}
            logItemsList={logsView ?? []}
            loadLogsAbove={loadLogsAbove}
            loadLogsBelow={loadLogsBelow}
            loadLogsFromHead={loadLogsFromHead}
            loadLogsFromTail={loadLogsFromTail}
            loadLogsAroundTargetLog={loadLogsBelow}
            updateListWithLastResults={() => {}}
            getLogListItemLevel={(item) => item.meta?.log_level as ELogsPanelLevel}
            getLogListItemName={(item) => item.id}
        />
    );
}
