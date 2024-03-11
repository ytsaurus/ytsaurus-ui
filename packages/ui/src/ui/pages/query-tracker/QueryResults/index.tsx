import React, {useEffect} from 'react';
import block from 'bem-cn-lite';
import {QueryItem} from '../module/api';
import {Tabs} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import {QueryResultsView} from '../QueryResultsView';
import {QueryMetaInfo} from './QueryMetaRow';
import QueryMetaTable from '../QueryMetaTable';
import {loadQueryResult} from '../module/query_result/actions';
import {QueryResultActions} from './QueryResultActions';
import {QueryResultTab, useQueryResultTabs} from './hooks/useQueryResultTabs';
import {YQLStatisticsTable} from '../QueryResultsView/YQLStatistics';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import {PlanProvider} from '../Plan/PlanContext';
import Plan from '../Plan/Plan';
import {usePrepareNode} from '../Plan/utils';
import PlanActions from '../Plan/PlanActions';

import './index.scss';
import {ErrorTree} from './ErrorTree';

const b = block('query-results');

function QueryResultContainer({
    query,
    activeResultParams,
}: {
    query: QueryItem;
    activeResultParams?: {queryId: string; resultIndex: number};
}) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (activeResultParams) {
            dispatch(loadQueryResult(activeResultParams.queryId, activeResultParams.resultIndex));
        }
    }, [activeResultParams, dispatch]);
    return <QueryResultsView query={query} index={activeResultParams?.resultIndex || 0} />;
}

export const QueryResults = React.memo(function QueryResults({
    query,
    className,
    toolbar,
    minimized = false,
}: {
    query: QueryItem;
    className: string;
    toolbar: React.ReactChild;
    minimized: boolean;
}) {
    const [tabs, setTab, {activeTabId, category, activeResultParams}] = useQueryResultTabs(query);
    if (!query) return null;

    const resultIndex = activeResultParams?.resultIndex;
    return (
        <div className={b(null, className)}>
            <div className={b('meta')}>
                <QueryMetaInfo className={b('meta-info')} query={query} />
                <div className={b('toolbar')}>{toolbar}</div>
            </div>
            <NotRenderUntilFirstVisible className={b('result', {minimized})} hide={minimized}>
                <PlanProvider
                    plan={query.progress?.yql_plan}
                    progress={query.progress?.yql_progress}
                    defaultView="graph"
                >
                    <div className={b('header')}>
                        <Tabs
                            className={b('tabs')}
                            items={tabs}
                            activeTab={activeTabId}
                            onSelectTab={(tabId: string) => setTab(tabId, query?.id)}
                        />
                        {category === QueryResultTab.RESULT && Number.isInteger(resultIndex) && (
                            <div className={b('tab_actions')}>
                                <QueryResultActions query={query} resultIndex={resultIndex ?? 0} />
                            </div>
                        )}
                        {category === QueryResultTab.PROGRESS && <PlanActions />}
                    </div>
                    <div className={b('content')}>
                        <NotRenderUntilFirstVisible
                            hide={
                                category !== QueryResultTab.RESULT && !Number.isInteger(resultIndex)
                            }
                            className={b('result-wrap')}
                        >
                            <QueryResultContainer
                                query={query}
                                activeResultParams={activeResultParams}
                            />
                        </NotRenderUntilFirstVisible>
                        {category === QueryResultTab.ERROR && <ErrorTree rootError={query.error} />}
                        {category === QueryResultTab.META && <QueryMetaTable query={query} />}

                        <NotRenderUntilFirstVisible hide={category !== QueryResultTab.STATISTIC}>
                            <YQLStatisticsTable query={query} />
                        </NotRenderUntilFirstVisible>
                        {category === QueryResultTab.PROGRESS && <PlanContainer isActive={true} />}
                    </div>
                </PlanProvider>
            </NotRenderUntilFirstVisible>
            <div></div>
        </div>
    );
});

interface PlanContainerProps {
    isActive: boolean;
}

function PlanContainer({isActive}: PlanContainerProps) {
    return <Plan isActive={isActive} prepareNode={usePrepareNode()} />;
}
