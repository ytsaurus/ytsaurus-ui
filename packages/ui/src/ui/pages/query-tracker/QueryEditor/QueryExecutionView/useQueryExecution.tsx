import React, {useCallback, useEffect, useMemo} from 'react';
import {
    type QueryExecutionPanelProps,
    type QueryExecutionTab,
} from '@gravity-ui/querieskit/widgets/QueryExecutionPanel';
import {Button, ClipboardButton, Flex, Icon} from '@gravity-ui/uikit';
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
import {Yson} from '../../../../components/Yson/Yson';
import format from '../../../../common/hammer/format';
import UIFactory from '../../../../UIFactory';
import metaI18n from '../../QueryResults/QueryMetaRow/i18n';
import {isAbortable} from '../../utils/query';
import {abortCurrentQuery} from '../../../../store/actions/query-tracker/query';
import stopIcon from '../../../../assets/img/svg/icons/stop-circle.svg';
import {ShareButton} from '../../QueryResults/ShareButton';
import {EditQueryACOModal} from '../../QueryACO/EditQueryACOModal/EditQueryACOModal';
import {QueryProgress} from '../../QueryResults/QueryResultActions/QueryProgress';
import {QueryDashboardCharts} from './QueryDashboardCharts';
import {parseResultTabIndex} from '../../QueryResults/helpers/parseResultTabIndex';
import {extractOperationIdToCluster} from '../../QueryResults/helpers/extractOperationIdToCluster';
import {useMonaco} from '../../hooks/useMonaco';
import {prepareError, prepareStatistics} from './adapters';
import {prepareProgress} from './progress';
import {useResultProps} from './results';
import {useMetadata} from './metadata';
import {getActiveExecutionTab} from './helpers';
import {closeCellPreviewAndCancelRequest} from '../../../../store/actions/modals/cell-preview';
import i18n from './i18n';

export function useQueryExecution({
    query,
    collapsed,
    active,
}: {
    query?: QueryItem;
    collapsed: boolean;
    active: boolean;
}): {props: QueryExecutionPanelProps; modal: React.ReactNode} {
    const dispatch = useDispatch();
    const sourceTabs = useSelector(selectQueryResultTabs);
    const selected = useSelector(selectActiveQueryResultTab);
    // Keep the library controlled even before Redux selects a tab, and reconcile removed tabs.
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
            dispatch(loadQueryResult(query.id, parseResultTabIndex(activeTab) || 0));
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
    const tabs: QueryExecutionTab[] = query?.id
        ? sourceTabs.map(({id, title}) => {
              if (id.startsWith('result/')) {
                  return {
                      id,
                      title,
                      type: 'result',
                      props: results[parseResultTabIndex(id) || 0] || {
                          columns: [],
                          rows: [],
                          loading: true,
                      },
                  };
              }
              if (id.startsWith('chart-tab/')) {
                  return {
                      id,
                      title,
                      type: 'charts',
                      renderContent: ({active: chartsActive}) => (
                          <QueryDashboardCharts
                              active={chartsActive}
                              key={`${query.id}/${id}`}
                              query={query}
                              resultIndex={parseResultTabIndex(id) || 0}
                          />
                      ),
                  };
              }
              if (id === 'progress') {
                  return {
                      id,
                      title,
                      type: 'progress',
                      props: {
                          ...progress,
                          active: !minimized,
                          graphProps: {...progress.graphProps, autoCenter},
                      },
                  };
              }
              if (id === 'statistic') {
                  return {
                      id,
                      title,
                      type: 'statistics',
                      props: {
                          data: metrics,
                          visibleColumns: ['min', 'max', 'avg', 'sum', 'count'],
                          fixedHeader: true,
                          virtual: false,
                          formatValue: (value, {column}) =>
                              format.Number(
                                  value,
                                  column === 'avg' && value !== undefined && value < 1
                                      ? {significantDigits: 6}
                                      : undefined,
                              ),
                      },
                  };
              }
              if (id === 'error') {
                  return {
                      id,
                      type: 'info',
                      props: error
                          ? {
                                root: error,
                                renderAttributes: (attributes) => (
                                    <Yson value={attributes} settings={{}} />
                                ),
                                onPositionClick: (_item, {row, column}) => {
                                    const editor = getEditor('queryEditor');
                                    editor?.focus();
                                    editor?.revealLine(row);
                                    editor?.setPosition(new Position(row, column));
                                },
                            }
                          : undefined,
                  };
              }
              return {id, title, type: 'meta', props: metadata.props};
          })
        : [];
    const AskAiButton = UIFactory.getAiChat().AskAiButton;
    const canAbort = query && isAbortable(query);
    const showErrorActions = !minimized && activeTab === 'error' && Boolean(query?.error);
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
                <Flex alignItems="center" gap={2} wrap>
                    <ShareButton />
                    <EditQueryACOModal query_id={query.id} />
                    {canAbort && (
                        <Button size="s" onClick={() => dispatch(abortCurrentQuery())}>
                            <Icon data={stopIcon} />
                            {metaI18n('action_stop')}
                        </Button>
                    )}
                    {showErrorActions && (
                        <>
                            <ClipboardButton
                                text={JSON.stringify(query.error, null, 4)}
                                tooltipInitialText={i18n('action_copy-error')}
                            />
                            {AskAiButton && <AskAiButton type="query-error-tree" />}
                        </>
                    )}
                </Flex>
            ),
            statusContent: query?.id ? <QueryProgress query={query} /> : undefined,
        },
        modal: metadata.modal,
    };
}
