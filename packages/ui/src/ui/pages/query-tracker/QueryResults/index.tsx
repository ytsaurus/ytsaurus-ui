import React, {ReactNode} from 'react';
import block from 'bem-cn-lite';
import {QueryItem, isSingleProgress} from '../../../types/query-tracker/api';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {QueryMetaInfo} from './QueryMetaRow';
import QueryMetaTable from '../QueryMetaTable';
import {QueryResultActions} from './QueryResultActions';
import {parseResultTabIndex} from './helpers/parseResultTabIndex';
import {YQLStatisticsTable} from '../QueryResultsView/YQLStatistics';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import {PlanProvider} from '../Plan/PlanContext';
import PlanActions from '../Plan/PlanActions';
import {QueryResultContainer} from './QueryResultContainer';
import {QueryChartTab} from './QueryChartTab';
import {PlanContainer} from './PlanContainer';
import {extractOperationIdToCluster} from './helpers/extractOperationIdToCluster';
import {
    QueryResultTab,
    setActiveTab,
    setUserChangeTab,
} from '../../../store/reducers/query-tracker/queryTabsSlice';

import './index.scss';
import {ErrorTree} from './ErrorTree';
import {QueryProgress} from './QueryResultActions/QueryProgress';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectActiveQueryResultTab,
    selectActiveResultParams,
    selectQueryResultTabs,
} from '../../../store/selectors/query-tracker/queryTabs';
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
    const dispatch = useDispatch();
    const tabs = useSelector(selectQueryResultTabs);
    const activeTabId = useSelector(selectActiveQueryResultTab);
    const activeResultParams = useSelector(selectActiveResultParams);

    const operationIdToCluster = React.useMemo(() => {
        return extractOperationIdToCluster(
            isSingleProgress(query?.progress) ? query?.progress?.yql_statistics : undefined,
        );
    }, [query?.progress]);

    if (!query) return null;

    const progress = isSingleProgress(query?.progress) ? query.progress : {};
    const resultIndex = activeResultParams?.resultIndex;

    const onTabChange = (id: string) => {
        dispatch(setUserChangeTab(true));
        dispatch(setActiveTab(id as QueryResultTab));
    };

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
                    <TabProvider
                        value={activeTabId}
                        onUpdate={(tabId: string) => setTab(tabId, query?.id)}
                    >
                        <div className={b('header')}>
                            <TabList className={b('tabs')}>
                                {tabs.map((tab) => (
                                    <Tab key={tab.id} value={tab.id}>
                                        {tab.title}
                                    </Tab>
                                ))}
                            </TabList>
                            {tabs.map((tab) => (
                                <TabPanel key={tab.id} value={tab.id}>
                                    {tab.id.startsWith(QueryResultTab.RESULT) &&
                                        category === QueryResultTab.RESULT &&
                                        Number.isInteger(resultIndex) && (
                                            <div className={b('tab_actions')}>
                                                <QueryResultActions
                                                    query={query}
                                                    resultIndex={resultIndex ?? 0}
                                                />
                                            </div>
                                        )}
                                    {tab.id === QueryResultTab.PROGRESS &&
                                        category === QueryResultTab.PROGRESS && <PlanActions />}
                                </TabPanel>
                            ))}
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
                                hide={!category.includes(QueryResultTab.CHART_TAB)}
                                className={b('result-wrap')}
                            >
                                <QueryChartTab
                                    query={query}
                                    resultIndex={parseResultTabIndex(category) || 0}
                                />
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
                    </TabProvider>
                </PlanProvider>
            </NotRenderUntilFirstVisible>
            <div></div>
        </div>
    );
});
