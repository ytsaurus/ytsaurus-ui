import {Loader} from '@gravity-ui/uikit';
import React from 'react';
import {useSelector} from 'react-redux';
import block from 'bem-cn-lite';
import {RootState} from '../../../store/reducers';
import {getQueryResult} from '../module/query_result/selectors';
import Error from '../../../components/Error/Error';
import {ResultsTable} from './ResultsTable';
import {QueryItem} from '../module/api';
import {
    QueryResultReadyState,
    QueryResultState,
    QueryResultsViewMode,
} from '../module/query_result/types';
import {YQLSchemeTable} from './YQLSchemeTable';
import {ResultPaginator} from './ResultPaginator';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';

import './index.scss';

const b = block('query-result-table');

function QueryReadyResultView({result}: {result: QueryResultReadyState}) {
    const mode = result?.settings?.viewMode;
    return (
        <>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Scheme}>
                <YQLSchemeTable result={result} />
            </NotRenderUntilFirstVisible>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Table}>
                <ResultsTable result={result} />
            </NotRenderUntilFirstVisible>
        </>
    );
}

export const QueryResultsView = React.memo(
    function QueryResultsView({query, index}: {query: QueryItem; index: number}) {
        const result = useSelector((state: RootState) => getQueryResult(state, query.id, index));

        return (
            <div className={b()}>
                {(result?.state === QueryResultState.Init ||
                    result?.state === QueryResultState.Loading) && (
                    <div className={b('loading')}>
                        <Loader size="m" />
                    </div>
                )}
                {result?.resultReady && (
                    <>
                        <QueryReadyResultView result={result} />
                        {result.settings.viewMode === QueryResultsViewMode.Table && (
                            <div className={b('floating-bottom-left')}>
                                <div className={b('padding_span')} />
                                <ResultPaginator
                                    className={b('pagination')}
                                    queryId={query.id}
                                    resultIndex={index}
                                />
                            </div>
                        )}
                    </>
                )}
                {result?.state === QueryResultState.Error && <Error error={result.error} />}
            </div>
        );
    },
    (prev, next) => prev.query.id === next.query.id && prev.index === next.index,
);
