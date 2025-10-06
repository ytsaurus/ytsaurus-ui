import React, {ReactNode} from 'react';
import block from 'bem-cn-lite';
import {QueryItem, isSingleProgress} from '../../../types/query-tracker/api';
import {Tabs} from '@gravity-ui/uikit';
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
                    <div className={b('header')}>
                        <Tabs
                            className={b('tabs')}
                            items={tabs}
                            activeTab={activeTabId}
                            onSelectTab={onTabChange}
                        />
                        {activeTabId?.includes('result') && Number.isInteger(resultIndex) && (
                            <div className={b('tab_actions')}>
                                <QueryResultActions query={query} resultIndex={resultIndex ?? 0} />
                            </div>
                        )}
                        {activeTabId === 'progress' && <PlanActions />}
                    </div>
                    <div className={b('content')}>
                        <NotRenderUntilFirstVisible
                            hide={
                                !activeTabId?.includes('result') && !Number.isInteger(resultIndex)
                            }
                            className={b('result-wrap')}
                        >
                            <QueryResultContainer
                                query={query}
                                activeResultParams={activeResultParams}
                            />
                        </NotRenderUntilFirstVisible>
                        <NotRenderUntilFirstVisible
                            hide={!activeTabId?.includes('chart-tab')}
                            className={b('result-wrap')}
                        >
                            <QueryChartTab
                                query={query}
                                resultIndex={parseResultTabIndex(activeTabId) || 0}
                            />
                        </NotRenderUntilFirstVisible>
                        {activeTabId === 'error' && <ErrorTree rootError={query.error} />}
                        {activeTabId === 'meta' && <QueryMetaTable query={query} />}
                        <NotRenderUntilFirstVisible hide={activeTabId !== 'statistic'}>
                            <YQLStatisticsTable />
                        </NotRenderUntilFirstVisible>
                        {activeTabId === 'progress' && (
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
