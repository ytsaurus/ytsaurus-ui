import React, {useEffect} from 'react';
import block from 'bem-cn-lite';
import {QueryItem} from '../module/api';
import {Tabs} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import {QueryResultsView} from '../QueryResultsView';
import Error from '../../../components/Error/Error';

import './index.scss';
import {QueryMetaInfo} from './QueryMetaRow';
import QueryMetaTable from '../QueryMetaTable';
import {loadQueryResult} from '../module/query_result/actions';
import {QueryResultActions} from './QueryResultActions';
import {QueryResultTab, useQueryResultTabs} from './hooks/useQueryResultTabs';
import {YQLStatisticsTable} from '../QueryResultsView/YQLStatistics';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';

const b = block('query-results');

function QueryResultContainer({resultIndex, query}: {resultIndex: number; query: QueryItem}) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (query.result_count) {
            dispatch(loadQueryResult(query.id, resultIndex));
        }
    }, [query, resultIndex, dispatch]);
    return <QueryResultsView query={query} index={resultIndex} />;
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
    const [tabs, setTab, {activeTabId, category, resultIndex}] = useQueryResultTabs(query);

    return query ? (
        <div className={b(null, className)}>
            <div className={b('meta')}>
                <QueryMetaInfo className={b('meta-info')} query={query} />
                <div className={b('toolbar')}>{toolbar}</div>
            </div>
            <NotRenderUntilFirstVisible className={b('result', {minimized})} hide={minimized}>
                <div className={b('header')}>
                    <Tabs
                        className={b('tabs')}
                        items={tabs}
                        activeTab={activeTabId}
                        onSelectTab={setTab}
                    />
                    {category === QueryResultTab.RESULT && Number.isInteger(resultIndex) && (
                        <div className={b('tab_actions')}>
                            <QueryResultActions query={query} resultIndex={resultIndex ?? 0} />
                        </div>
                    )}
                </div>
                <div className={b('content')}>
                    <NotRenderUntilFirstVisible
                        hide={category !== QueryResultTab.RESULT && !Number.isInteger(resultIndex)}
                        className={b('result-wrap')}
                    >
                        <QueryResultContainer query={query} resultIndex={resultIndex ?? 0} />
                    </NotRenderUntilFirstVisible>
                    {category === QueryResultTab.ERROR && <Error error={query.error} />}
                    {category === QueryResultTab.META && <QueryMetaTable query={query} />}

                    <NotRenderUntilFirstVisible hide={category !== QueryResultTab.STATISTIC}>
                        <YQLStatisticsTable query={query} />
                    </NotRenderUntilFirstVisible>
                </div>
            </NotRenderUntilFirstVisible>
            <div></div>
        </div>
    ) : null;
});
