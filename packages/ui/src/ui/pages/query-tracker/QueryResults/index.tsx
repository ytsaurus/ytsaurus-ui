import React, {ReactNode, memo, useCallback, useState} from 'react';
import block from 'bem-cn-lite';
import {QueryItem, isSingleProgress} from '../../../types/query-tracker/api';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {QueryMetaInfo} from './QueryMetaRow';
import QueryMetaTable from '../QueryMetaTable';
import {QueryResultActions} from './QueryResultActions';
import {parseResultTabIndex} from './helpers/parseResultTabIndex';
import {YQLStatisticsTable} from '../QueryResultsView/YQLStatistics';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import {PlanActions, PlanView} from '../Plan/PlanActions';
import {QueryResultContainer} from './QueryResultContainer';
import {QueryChartTab} from './QueryChartTab';
import {extractOperationIdToCluster} from './helpers/extractOperationIdToCluster';
import {
    QueryResultTab,
    setActiveTab,
    setUserChangeTab,
} from '../../../store/reducers/query-tracker/queryTabsSlice';

import './index.scss';
import {ErrorTree} from './ErrorTree';
import {QueryProgress} from './QueryResultActions/QueryProgress';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectActiveQueryResultTab,
    selectActiveResultParams,
    selectQueryResultTabs,
} from '../../../store/selectors/query-tracker/queryTabs';
import Plan from '../Plan/Plan';
import {preparePlanNode} from '../Plan/services/preparePlanNode';
import {ProcessedNode} from '../Plan/utils';
const b = block('query-results');

type Props = {
    query: QueryItem;
    className: string;
    toolbar: ReactNode;
    minimized: boolean;
};

export const QueryResults = memo<Props>(function QueryResults({
    query,
    className,
    toolbar,
    minimized = false,
}) {
    const dispatch = useDispatch();
    const tabs = useSelector(selectQueryResultTabs);
    const activeTabId = useSelector(selectActiveQueryResultTab);
    const activeResultParams = useSelector(selectActiveResultParams);

    const [planView, setPlanView] = useState<PlanView>('graph');

    const operationIdToCluster = React.useMemo(() => {
        return extractOperationIdToCluster(
            isSingleProgress(query?.progress) ? query?.progress?.yql_statistics : undefined,
        );
    }, [query?.progress]);

    const handlePrepareNode = useCallback(
        (node: ProcessedNode) => preparePlanNode(node, operationIdToCluster),
        [operationIdToCluster],
    );

    if (!query) return null;

    const resultIndex = activeResultParams?.resultIndex;

    const onTabChange = (id: string) => {
        dispatch(setUserChangeTab(true));
        dispatch(setActiveTab(id as QueryResultTab));
    };

    const getTabContent = (tabId: string) => {
        if (tabId?.includes('result')) {
            return (
                <NotRenderUntilFirstVisible className={b('result-wrap')}>
                    <QueryResultContainer query={query} activeResultParams={activeResultParams} />
                </NotRenderUntilFirstVisible>
            );
        }
        if (tabId?.includes('chart-tab')) {
            return (
                <NotRenderUntilFirstVisible className={b('result-wrap')}>
                    <QueryChartTab query={query} resultIndex={parseResultTabIndex(tabId) || 0} />
                </NotRenderUntilFirstVisible>
            );
        }
        if (tabId === 'error') {
            return <ErrorTree rootError={query.error} />;
        }
        if (tabId === 'meta') {
            return <QueryMetaTable query={query} />;
        }
        if (tabId === 'statistic') {
            return (
                <NotRenderUntilFirstVisible>
                    <YQLStatisticsTable />
                </NotRenderUntilFirstVisible>
            );
        }
        if (tabId === 'progress') {
            return <Plan planView={planView} isActive prepareNode={handlePrepareNode} />;
        }
        return null;
    };

    return (
        <div className={b(null, className)}>
            <div className={b('meta')}>
                <QueryMetaInfo className={b('meta-info')} query={query} />
                <div className={b('toolbar')}>{toolbar}</div>
            </div>
            <QueryProgress query={query} />
            <NotRenderUntilFirstVisible className={b('result', {minimized})} hide={minimized}>
                <TabProvider value={activeTabId || ''} onUpdate={onTabChange}>
                    <div className={b('header')}>
                        <TabList className={b('tabs')}>
                            {tabs.map((tab) => (
                                <Tab key={tab.id} value={tab.id}>
                                    {tab.title}
                                </Tab>
                            ))}
                        </TabList>
                        {activeTabId?.includes('result') && Number.isInteger(resultIndex) && (
                            <div className={b('tab_actions')}>
                                <QueryResultActions query={query} resultIndex={resultIndex ?? 0} />
                            </div>
                        )}
                        {activeTabId === 'progress' && (
                            <PlanActions value={planView} onUpdate={setPlanView} />
                        )}
                    </div>
                    <div className={b('content')}>
                        {tabs.map((tab) => (
                            <TabPanel key={tab.id} value={tab.id} className={b('tab-panel')}>
                                {getTabContent(tab.id)}
                            </TabPanel>
                        ))}
                    </div>
                </TabProvider>
            </NotRenderUntilFirstVisible>
            <div></div>
        </div>
    );
});
