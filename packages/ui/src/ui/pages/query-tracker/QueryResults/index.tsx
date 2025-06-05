import React, {ReactNode} from 'react';
import block from 'bem-cn-lite';
import {QueryItem, isSingleProgress} from '../module/api';
import {Tabs} from '@gravity-ui/uikit';
import {QueryMetaInfo} from './QueryMetaRow';
import QueryMetaTable from '../QueryMetaTable';
import {QueryResultActions} from './QueryResultActions';
import {QueryResultTab, useQueryResultTabs} from './hooks/useQueryResultTabs';
import {YQLStatisticsTable} from '../QueryResultsView/YQLStatistics';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import {PlanProvider} from '../Plan/PlanContext';
import PlanActions from '../Plan/PlanActions';
import {QueryResultContainer} from './QueryResultContainer';
import {QueryChartTab} from './QueryChartTab';
import {PlanContainer} from './PlanContainer';
import {extractOperationIdToCluster} from './helpers/extractOperationIdToCluster';

import './index.scss';
import {ErrorTree} from './ErrorTree';
import {QueryProgress} from './QueryResultActions/QueryProgress';
const b = block('query-results');

type Props = {
    query: QueryItem;
    className: string;
    toolbar: ReactNode;
    minimized: boolean;
};

export const QueryResults = React.memo<Props>(function QueryResults({
    query,
    className,
    toolbar,
    minimized = false,
}) {
    const [tabs, setTab, {activeTabId, category, activeResultParams}] = useQueryResultTabs(query);
    const operationIdToCluster = React.useMemo(() => {
        return extractOperationIdToCluster(
            isSingleProgress(query?.progress) ? query?.progress?.yql_statistics : undefined,
        );
    }, [query?.progress]);

    if (!query) return null;

    const progress = isSingleProgress(query?.progress) ? query.progress : {};
    const resultIndex = activeResultParams?.resultIndex;

    return (
        <div className={b(null, className)}>
            <div className={b('meta')}>
                <QueryMetaInfo className={b('meta-info')} query={query} />
                <div className={b('toolbar')}>{toolbar}</div>
            </div>
            <QueryProgress query={query} />
            <NotRenderUntilFirstVisible className={b('result', {minimized})} hide={minimized}>
                <PlanProvider
                    plan={progress.yql_plan}
                    progress={progress?.yql_progress}
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
                        <NotRenderUntilFirstVisible
                            hide={category !== QueryResultTab.CHART_TAB}
                            className={b('result-wrap')}
                        >
                            <QueryChartTab query={query} />
                        </NotRenderUntilFirstVisible>
                        {category === QueryResultTab.ERROR && <ErrorTree rootError={query.error} />}
                        {category === QueryResultTab.META && <QueryMetaTable query={query} />}

                        <NotRenderUntilFirstVisible hide={category !== QueryResultTab.STATISTIC}>
                            <YQLStatisticsTable />
                        </NotRenderUntilFirstVisible>
                        {category === QueryResultTab.PROGRESS && (
                            <PlanContainer
                                isActive={true}
                                operationIdToCluster={operationIdToCluster}
                            />
                        )}
                    </div>
                </PlanProvider>
            </NotRenderUntilFirstVisible>
            <div></div>
        </div>
    );
});
