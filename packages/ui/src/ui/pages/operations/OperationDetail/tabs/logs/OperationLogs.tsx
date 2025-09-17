import React, {useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {ELogsPanelLevel, LogsPanel, TLogsPanelProps} from '@yandex-data-ui/dynamic-logs-viewer';

import {
    useOperationLogsListQuery,
    useOperationLogsViewQuery,
} from '../../../../../store/api/operations/operaion-detail/logs';
import {ViewOperationLogsArgs} from '../../../../../store/api/operations/operaion-detail/logs/view';
import {getOperation} from '../../../../../store/selectors/operations/operation';
import {getCluster} from '../../../../../store/selectors/global';
import {LogMeta} from '../../../../../types/operations/logs';

export function OperationLogs() {
    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    const operationParams = {
        cluster,
        operationId: operation.id,
    };

    const {data: logsListResponse, isLoading: isListLoading} =
        useOperationLogsListQuery(operationParams);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<TLogsPanelProps['timeRange']>(null);
    const [paginationOptions, setPaginationOptions] = useState<
        ViewOperationLogsArgs['pagination_options']
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
    } = useOperationLogsViewQuery({
        ...operationParams,
        substring_filter: {
            substring: searchQuery,
            is_substring_case_sensetive: false,
        },
        log_group_filters:
            logsListResponse?.raw?.map?.((group) => ({
                group_info: group.group_info,
                logs_filter: [
                    {log_name: 'abc', file_paths: ['asd'], log_meta: {log_level: 'ERROR' as const}},
                ],
            })) ?? [],
        pagination_options: paginationOptions,
        time_range_filter: {
            ts_from: String(timeRange?.start?.value),
            ts_to: String(timeRange?.end?.value),
        },
    });

    const loadLogsAbove = async () => {
        console.log('above');
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
