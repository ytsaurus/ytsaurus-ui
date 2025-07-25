import {TabsItemProps} from '@gravity-ui/uikit';
import times_ from 'lodash/times';
import has_ from 'lodash/has';
import find_ from 'lodash/find';
import {QueryStatus} from '../../../../types/query-tracker';
import {CompletedStates, QueryItem, isSingleProgress} from '../../module/api';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loadQueryResultsErrors} from '../../module/query_result/actions';
import {getQueryResults} from '../../module/query_result/selectors';
import {RootState} from '../../../../store/reducers';
import UIFactory from '../../../../UIFactory';
import {QueryStatusIcon} from '../../../../components/QueryStatus';

export enum QueryResultTab {
    ERROR = 'error',
    META = 'meta',
    RESULT = 'result',
    STATISTIC = 'statistic',
    PROGRESS = 'progress',
    CHART_TAB = 'chart-tab',
}

const isResultTab = (tabId: string) => tabId.startsWith('result/');
const createTabId = (tab: QueryResultTab, index: number) => `${tab}/${index}`;

export const parseResultTabIndex = (tabId: string) => {
    const parts = tabId.split('/');
    return parts?.[1] ? parseInt(parts?.[1], 10) : undefined;
};

type ResultCurrentState = {
    activeTabId: string;
    category: QueryResultTab;
    activeResultParams?: {queryId: string; resultIndex: number};
};

export const useQueryResultTabs = (
    query?: QueryItem,
): [TabsItemProps[], (tab: string, queryId?: string) => void, ResultCurrentState] => {
    const [progressActive, setProgressActive] = useState(false);
    const [tab, setTab] = useState<QueryResultTab>(QueryResultTab.META);
    const [activeResultParams, setResultParams] =
        useState<ResultCurrentState['activeResultParams']>(undefined);
    const dispatch = useDispatch();
    const resultsMeta = useSelector((state: RootState) => getQueryResults(state, query?.id || ''));

    const activeTabId = useMemo(() => {
        if (tab === QueryResultTab.RESULT) {
            return createTabId(QueryResultTab.RESULT, activeResultParams?.resultIndex || 0);
        }
        return tab;
    }, [tab, activeResultParams]);

    const setActiveTab = useCallback(
        (tabId: string, queryId?: string) => {
            if (isResultTab(tabId)) {
                setTab(QueryResultTab.RESULT);
                const id = queryId || activeResultParams?.queryId;
                if (id) {
                    setResultParams({
                        queryId: id,
                        resultIndex: parseResultTabIndex(tabId) || 0,
                    });
                } else {
                    setResultParams(undefined);
                }
            } else {
                setTab(tabId as QueryResultTab);
                setResultParams(undefined);
            }
        },
        [activeResultParams],
    );

    const tabs = useMemo(() => {
        if (!query) {
            return [];
        }
        const items: TabsItemProps[] = [];
        const progress = isSingleProgress(query?.progress) ? query.progress : {};

        if (query.state === QueryStatus.FAILED) {
            items.push({id: QueryResultTab.ERROR, title: 'Error'});
        }

        if (query.state === QueryStatus.COMPLETED) {
            items.push(
                ...times_(query.result_count, (num) => {
                    let icon;
                    if (resultsMeta && resultsMeta[num] && has_(resultsMeta[num], 'error')) {
                        icon = (
                            <QueryStatusIcon
                                status={QueryStatus.FAILED}
                                className={'query-status_tabs'}
                            />
                        );
                    }
                    return {
                        id: createTabId(QueryResultTab.RESULT, num),
                        title: query.result_count === 1 ? 'Result' : `Result #${num + 1}`,
                        icon,
                    };
                }),
            );
        }

        const emptyProgress =
            !progress?.yql_plan?.Basic.nodes.length && !progress?.yql_plan?.Basic.links?.length;
        if (query.progress && !emptyProgress) {
            items.push({
                id: QueryResultTab.PROGRESS,
                title: 'Progress',
            });
        }

        if (query.state === QueryStatus.COMPLETED) {
            const queryResultChartTab = UIFactory.getQueryResultChartTab();
            if (queryResultChartTab && query.result_count) {
                items.push(
                    ...times_(query.result_count, (num) => {
                        const suffix = query.result_count === 1 ? '' : ` #${num + 1}`;
                        return {
                            id: createTabId(QueryResultTab.CHART_TAB, num),
                            title: queryResultChartTab.title + suffix,
                        };
                    }),
                );
            }

            if (progress?.yql_statistics) {
                items.push({
                    id: QueryResultTab.STATISTIC,
                    title: 'Statistics',
                });
            }
        }

        items.push({id: QueryResultTab.META, title: 'Meta'});

        return items;
    }, [query, resultsMeta]);

    const isCompleted = find_(CompletedStates, (status) => query?.state === status);

    useEffect(() => {
        if (query) {
            dispatch(loadQueryResultsErrors(query));
        }
        setActiveTab(tabs?.[0]?.id, query?.id);
    }, [dispatch, query?.id, isCompleted]);

    useEffect(() => {
        const hasResultTab = tabs.some((tab) => tab.id === QueryResultTab.PROGRESS);
        if (hasResultTab && query?.state === QueryStatus.RUNNING && !progressActive) {
            setProgressActive(true);
            setTab(QueryResultTab.PROGRESS);
        }
    }, [progressActive, query?.state, tabs]);

    return [
        tabs,
        setActiveTab,
        {
            activeTabId,
            category: tab,
            activeResultParams,
        },
    ];
};
