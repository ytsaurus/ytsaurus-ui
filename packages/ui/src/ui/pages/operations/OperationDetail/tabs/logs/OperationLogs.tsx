import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {LogsPanel, TLogsPanelProps} from '@yandex-data-ui/dynamic-logs-viewer';

import {
    useOperationLogsListQuery,
    useOperationLogsViewQuery,
} from '../../../../../store/api/operations/operaion-detail/logs';
import {getOperation} from '../../../../../store/selectors/operations/operation';
import {getCluster} from '../../../../../store/selectors/global';
import {LogsMeta} from '../../../../../store/api/operations/operaion-detail/logs/view';
import {LogLevel} from '../../../../../types/operations/logs';

export function OperationLogs() {
    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    const operationParams = {
        cluster,
        operationId: operation.id,
    };

    const {data: logsList, isLoading: isListLoading} = useOperationLogsListQuery(operationParams);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<TLogsPanelProps['timeRange']>(null);
    const [settings, setSettings] = useState({
        wrapLines: true,
        renderLinks: true,
        caseInsensitiveSearch: true,
    });

    const {data: logsView, isLoading: isViewLoading} = useOperationLogsViewQuery({
        ...operationParams,
        substring_filter: {
            substring: searchQuery,
            is_substring_case_sensetive: false,
        },
        names_filter: selectedLogIds.map((name) => ({
            log_name: name,
        })),
        time_range_filter: {
            ts_from: String(timeRange?.start?.value),
            ts_to: String(timeRange?.end?.value),
        },
    });

    return (
        <LogsPanel<LogsMeta>
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            settings={settings}
            onSettingsChange={setSettings}
            logsSelectorOptions={logsList ?? []}
            logsSelectorSelectedIds={selectedLogIds}
            onLogsSelectorSelectedIdsChange={setSelectedLogIds}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            loading={isViewLoading || isListLoading}
            logItemsList={logsView ?? []}
            loadLogsAbove={async () => {}}
            loadLogsBelow={async () => {}}
            loadLogsFromHead={async () => {}}
            loadLogsFromTail={async () => {}}
            loadLogsAroundTargetLog={async () => {}}
            updateListWithLastResults={() => {}}
            getLogListItemLevel={(item) => item.meta.level as LogLevel}
            getLogListItemName={(item) => item.id}
        />
    );
}
