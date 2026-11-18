import React, {useCallback, useEffect, useMemo} from 'react';
import type {QueryExecutionPanelProps} from '@gravity-ui/querieskit/widgets/QueryExecutionPanel';
import {Position} from 'monaco-editor';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectActiveQueryResultTab,
    selectQueryResultTabs,
} from '../../../../store/selectors/query-tracker/queryTabs';
import {
    type QueryResultTab,
    setActiveTab,
    setUserChangeTab,
} from '../../../../store/reducers/query-tracker/queryTabsSlice';
import {loadQueryResult} from '../../../../store/actions/query-tracker/queryResult';
import {
    selectNodesWithProgress,
    selectProcessedGraph,
} from '../../../../store/selectors/query-tracker/queryPlan';
import {selectProgressYQLStatistics} from '../../../../store/selectors/query-tracker/query';
import {selectSettingsQueryTrackerGraphAutoCenter} from '../../../../store/selectors/settings/settings-ts';
import {type QueryItem, isSingleProgress} from '../../../../types/query-tracker/api';
import format from '../../../../common/hammer/format';
import {QueryProgress} from '../../QueryResults/QueryResultActions/QueryProgress';
import {parseResultTabIndex} from '../../QueryResults/helpers/parseResultTabIndex';
import {extractOperationIdToCluster} from '../../QueryResults/helpers/extractOperationIdToCluster';
import {useMonaco} from '../../hooks/useMonaco';
import {prepareError, prepareStatistics} from './adapters';
import {prepareProgress} from './progress';
import {useResultProps} from './results';
import type {QueryResultReadyState} from '../../../../types/query-tracker/queryResult';
import {useMetadata} from './metadata';
import {getActiveExecutionTab} from './helpers';
import {prepareExecutionTabs} from './tabs';
import {QueryExecutionActions} from './QueryExecutionActions/QueryExecutionActions';
import {closeCellPreviewAndCancelRequest} from '../../../../store/actions/modals/cell-preview';

export function useQueryExecution({
    query,
    collapsed,
    active,
}: {
    query?: QueryItem;
    collapsed: boolean;
    active: boolean;
}): {
    props: QueryExecutionPanelProps<QueryResultReadyState['results'][number]>;
    modal: React.ReactNode;
} {
    const dispatch = useDispatch();
    const sourceTabs = useSelector(selectQueryResultTabs);
    const selected = useSelector(selectActiveQueryResultTab);
    const activeTab = getActiveExecutionTab(query?.id, sourceTabs, selected);
    const nodes = useSelector(selectNodesWithProgress);
    const graph = useSelector(selectProcessedGraph);
    const autoCenter = useSelector(selectSettingsQueryTrackerGraphAutoCenter);
    const statistics = useSelector(selectProgressYQLStatistics);
    const minimized = collapsed || !active;
    const results = useResultProps(query, !minimized, activeTab);
    const metadata = useMetadata(query, active && !collapsed && activeTab === 'meta');
    const {getEditor} = useMonaco();

    useEffect(() => {
        dispatch(closeCellPreviewAndCancelRequest());
    }, [dispatch, minimized, activeTab, query?.id]);

    useEffect(() => {
        if (activeTab && activeTab !== selected) dispatch(setActiveTab(activeTab));
    }, [activeTab, selected, dispatch]);

    useEffect(() => {
        if (query?.id && !minimized && activeTab.startsWith('result/')) {
            dispatch(
                loadQueryResult(query.id, parseResultTabIndex(activeTab) || 0, {fromStart: true}),
            );
        }
    }, [dispatch, query?.id, activeTab, minimized]);

    const onTabChange = useCallback(
        (id: string) => {
            if (!sourceTabs.some((tab) => tab.id === id)) return;
            dispatch(setUserChangeTab(true));
            dispatch(setActiveTab(id as QueryResultTab));
        },
        [dispatch, sourceTabs],
    );

    const progress = useMemo(
        () =>
            prepareProgress(
                nodes,
                graph?.edges || [],
                extractOperationIdToCluster(
                    query && isSingleProgress(query.progress)
                        ? query.progress.yql_statistics
                        : undefined,
                ),
            ),
        [nodes, graph, query],
    );
    const error = useMemo(
        () => (query?.error ? prepareError(query.error) : undefined),
        [query?.error],
    );
    const metrics = useMemo(() => prepareStatistics(statistics), [statistics]);
    const tabs = prepareExecutionTabs({
        query,
        sourceTabs,
        results,
        progress: {
            ...progress,
            active: !minimized,
            graphProps: {...progress.graphProps, autoCenter},
        },
        metrics,
        error,
        metadata: metadata.props,
        onPositionClick: (_item, {row, column}) => {
            const editor = getEditor('queryEditor');
            editor?.focus();
            editor?.revealLine(row);
            editor?.setPosition(new Position(row, column));
        },
    });
    const startedAt = query?.start_time
        ? format.DateTime(query.start_time, {pattern: 'D MMM YYYY, HH:mm:ss'})
        : undefined;

    return {
        props: {
            tabs,
            active,
            activeTab: tabs.length ? activeTab : '',
            onActiveTabChange: onTabChange,
            execution: query?.id ? {startedAt, author: query.user} : undefined,
            emptyContent: null,
            headerActions: query?.id && active && (
                <QueryExecutionActions
                    query={query}
                    showErrorActions={!minimized && activeTab === 'error'}
                />
            ),
            statusContent: query?.id ? <QueryProgress query={query} /> : undefined,
        },
        modal: metadata.modal,
    };
}
