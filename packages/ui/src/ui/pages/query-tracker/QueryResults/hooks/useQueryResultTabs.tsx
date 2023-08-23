import {TabsItemProps} from '@gravity-ui/uikit';
import times_ from 'lodash/times';
import has_ from 'lodash/has';
import {QueryItem, QueryStatus} from '../../module/api';
import {QueryStatusIcon} from '../../QueryStatus';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loadQueryResultsErrors} from '../../module/query_result/actions';
import {getQueryResults} from '../../module/query_result/selectors';
import {RootState} from '../../../../store/reducers';

export enum QueryResultTab {
    ERROR = 'error',
    META = 'meta',
    RESULT = 'result',
    STATISTIC = 'statistic',
}

const isResultTab = (tabId: string) => tabId.startsWith('result/');

const createResultTabId = (index: number) => `result/${index}`;

const parseResultTabIndex = (tabId: string) => {
    const parts = tabId.split('/');
    return parts?.[1] ? parseInt(parts?.[1], 10) : undefined;
};

type ResultCurrentState = {
    activeTabId: string;
    category: QueryResultTab;
    resultIndex?: number;
};

export const useQueryResultTabs = (
    query?: QueryItem,
): [TabsItemProps[], (tab: string) => void, ResultCurrentState] => {
    const [tab, setTab] = useState<QueryResultTab>(QueryResultTab.META);
    const [resultIndex, setActiveIndex] = useState<number | undefined>(undefined);
    const dispatch = useDispatch();
    const resultsMeta = useSelector((state: RootState) => getQueryResults(state, query?.id || ''));

    const activeTabId = useMemo(() => {
        if (tab === QueryResultTab.RESULT) {
            return createResultTabId(resultIndex || 0);
        }
        return tab;
    }, [tab, resultIndex]);

    const setActiveTab = useCallback(
        (tab: string) => {
            if (isResultTab(tab)) {
                setTab(QueryResultTab.RESULT);
                setActiveIndex(parseResultTabIndex(tab));
            } else {
                setTab(tab as QueryResultTab);
                setActiveIndex(undefined);
            }
        },
        [setTab],
    );

    const tabs = useMemo(() => {
        if (!query) {
            return [];
        }
        const items: TabsItemProps[] = [{id: QueryResultTab.META, title: 'Meta'}];
        if (query.state === QueryStatus.FAILED) {
            items.unshift({id: QueryResultTab.ERROR, title: 'Error'});
        } else if (query.state === QueryStatus.COMPLETED) {
            if (query.progress?.yql_statistics) {
                items.unshift({
                    id: QueryResultTab.STATISTIC,
                    title: 'Statistics',
                });
            }
            items.unshift(
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
                        id: createResultTabId(num),
                        title: query.result_count === 1 ? 'Result' : `Result #${num + 1}`,
                        icon,
                    };
                }),
            );
        }
        return items;
    }, [query, resultsMeta]);

    useEffect(() => {
        if (query) {
            dispatch(loadQueryResultsErrors(query));
        }
        setActiveTab(tabs?.[0]?.id);
    }, [query]);

    return [
        tabs,
        setActiveTab,
        {
            activeTabId,
            category: tab,
            resultIndex,
        },
    ];
};
