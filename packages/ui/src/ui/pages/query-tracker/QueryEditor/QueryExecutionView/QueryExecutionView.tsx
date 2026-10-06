import React, {useCallback, useEffect, useMemo} from 'react';
import {
    QueryExecutionPanel,
    type QueryExecutionTab,
} from '@gravity-ui/querieskit/widgets/QueryExecutionPanel';
import {Button, ClipboardButton, Flex, Icon, Text} from '@gravity-ui/uikit';
import {LayoutFooter} from '@gravity-ui/icons';
import {Position} from 'monaco-editor';
import cn from 'bem-cn-lite';

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
import {QueryProgress} from '../../QueryResults/QueryResultActions/QueryProgress';
import {QueryChartTab} from '../../QueryResults/QueryChartTab';
import {parseResultTabIndex} from '../../QueryResults/helpers/parseResultTabIndex';
import {extractOperationIdToCluster} from '../../QueryResults/helpers/extractOperationIdToCluster';
import {useMonaco} from '../../hooks/useMonaco';
import type {ResultMode} from '../QueryEditor';
import {prepareError, prepareStatistics} from './adapters';
import {prepareProgress} from './progress';
import {useResultProps} from './results';
import {useMetadata} from './metadata';
import i18n from './i18n';
import './QueryExecutionView.scss';

const b = cn('yt-query-execution-view');

type Props = {
    query: QueryItem;
    resultViewMode: ResultMode;
    setResultViewMode: (mode: ResultMode) => void;
};

export function QueryExecutionView({query, resultViewMode, setResultViewMode}: Props) {
    const dispatch = useDispatch();
    const sourceTabs = useSelector(selectQueryResultTabs);
    const selected = useSelector(selectActiveQueryResultTab);
    // Keep the library controlled even before Redux selects a tab, and reconcile removed tabs.
    const activeTab = sourceTabs.find(({id}) => id === selected)?.id ?? sourceTabs[0]?.id ?? '';
    const nodes = useSelector(selectNodesWithProgress);
    const graph = useSelector(selectProcessedGraph);
    const autoCenter = useSelector(selectSettingsQueryTrackerGraphAutoCenter);
    const statistics = useSelector(selectProgressYQLStatistics);
    const results = useResultProps(query);
    const metadata = useMetadata(query);
    const {getEditor} = useMonaco();
    const minimized = resultViewMode === 'minimized';

    useEffect(() => {
        if (activeTab && activeTab !== selected) dispatch(setActiveTab(activeTab));
    }, [activeTab, selected, dispatch]);

    useEffect(() => {
        if (!minimized && activeTab.startsWith('result/')) {
            dispatch(loadQueryResult(query.id, parseResultTabIndex(activeTab) || 0));
        }
    }, [dispatch, query.id, activeTab, minimized]);

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
                    isSingleProgress(query.progress) ? query.progress.yql_statistics : undefined,
                ),
            ),
        [nodes, graph, query.progress],
    );
    const error = useMemo(
        () => (query.error ? prepareError(query.error) : undefined),
        [query.error],
    );
    const metrics = useMemo(() => prepareStatistics(statistics), [statistics]);
    const tabs: QueryExecutionTab[] = sourceTabs.map(({id, title}) => {
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
                renderContent: () => (
                    <QueryChartTab
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
    });
    const AskAiButton = UIFactory.getAiChat().AskAiButton;
    const canAbort = isAbortable(query);
    const showErrorActions = !minimized && activeTab === 'error' && Boolean(query.error);
    const startedAt = format.DateTime(query.start_time, {pattern: 'D MMM YYYY, HH:mm:ss'});

    return (
        <div className={b({minimized})}>
            {(minimized || canAbort || showErrorActions) && (
                <Flex alignItems="center" gap={2} wrap className={b('toolbar')}>
                    {minimized && (
                        <Flex alignItems="center" gap={2} wrap className={b('meta')}>
                            <Text>{startedAt}</Text>
                            <Text color="secondary">
                                {metaI18n('context_by-user', {user: query.user})}
                            </Text>
                        </Flex>
                    )}
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
                    {minimized && (
                        <Button
                            view="flat"
                            title={i18n('action_restore')}
                            aria-label={i18n('action_restore')}
                            onClick={() => setResultViewMode('split')}
                        >
                            <Icon data={LayoutFooter} />
                        </Button>
                    )}
                </Flex>
            )}
            <QueryProgress query={query} />
            <div className={b('panel')} hidden={minimized}>
                <QueryExecutionPanel
                    tabs={tabs}
                    execution={{startedAt, author: query.user}}
                    activeTab={activeTab}
                    onActiveTabChange={onTabChange}
                    expanded={resultViewMode === 'full'}
                    onExpandedChange={(expanded) => setResultViewMode(expanded ? 'full' : 'split')}
                    onClose={() => setResultViewMode('minimized')}
                />
            </div>
            {metadata.modal}
        </div>
    );
}
