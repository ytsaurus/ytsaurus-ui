import {Loader, Text} from '@gravity-ui/uikit';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
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
import {showQueryTrackerCellPreviewModal} from '../module/cell-preview/actions';

const b = block('query-result-table');

const getResultRowsInfo = (result: QueryResultReadyState) => {
    const {row_count: total} = result.meta.data_statistics;
    const {is_truncated: truncated} = result.meta;
    const {pageSize} = result.settings;
    const start = pageSize * result.page + 1;
    const end = Math.min(pageSize * result.page + pageSize, total);
    return {start, end, total, truncated};
};

function QueryReadyResultView({
    result,
    onShowPreview,
}: {
    result: QueryResultReadyState;
    onShowPreview: (colName: string, rowIndex: number) => void;
}) {
    const mode = result?.settings?.viewMode;
    const {start, end, total, truncated} = getResultRowsInfo(result);
    return (
        <>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Scheme}>
                <YQLSchemeTable result={result} />
            </NotRenderUntilFirstVisible>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Table}>
                <div className={b('result-info')}>
                    <Text>
                        Rows {start}-{end} of {total}
                        {`${truncated ? ' (truncated)' : ''}`}
                    </Text>
                </div>
                <ResultsTable result={result} onShowPreview={onShowPreview} />
            </NotRenderUntilFirstVisible>
        </>
    );
}

export const QueryResultsView = React.memo(
    function QueryResultsView({query, index}: {query: QueryItem; index: number}) {
        const dispatch = useDispatch();

        const result = useSelector((state: RootState) => getQueryResult(state, query.id, index));

        const handleShowPreviewClick = React.useCallback(
            (columnName: string, rowIndex: number) => {
                dispatch(
                    showQueryTrackerCellPreviewModal(query.id, index, {
                        columnName,
                        rowIndex,
                    }),
                );
            },
            [index, query.id],
        );

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
                        <QueryReadyResultView
                            result={result}
                            onShowPreview={handleShowPreviewClick}
                        />
                        {result.settings.viewMode === QueryResultsViewMode.Table && (
                            <ResultPaginator
                                className={b('pagination')}
                                queryId={query.id}
                                resultIndex={index}
                            />
                        )}
                    </>
                )}
                {result?.state === QueryResultState.Error && <Error error={result.error} />}
            </div>
        );
    },
    (prev, next) => prev.query.id === next.query.id && prev.index === next.index,
);
