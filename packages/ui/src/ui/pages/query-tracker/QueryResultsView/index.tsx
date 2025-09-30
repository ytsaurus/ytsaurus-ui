import {Flex, Icon, Link, Loader, Text} from '@gravity-ui/uikit';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import block from 'bem-cn-lite';

import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';

import {RootState} from '../../../store/reducers';
import {
    CellDataHandlerQueries,
    isInlinePreviewAllowed,
    onErrorTableCellPreview,
} from '../../../types/navigation/table-cell-preview';
import {getQueryResult, getQueryResultSettings} from '../../../store/selectors/queries/queryResult';
import {YTErrorBlock} from '../../../components/Error/Error';
import {ResultsTable} from './ResultsTable';
import {QueryItem} from '../../../store/actions/queries/api';
import {
    QueryResultReadyState,
    QueryResultState,
    QueryResultsViewMode,
} from '../../../types/query-tracker/queryResult';
import {YQLSchemeTable} from './YQLSchemeTable';
import {ResultPaginator} from './ResultPaginator';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import './index.scss';
import {onCellPreviewQueryResults} from '../../../store/actions/queries/cellPreview';
import {ShowPreviewCallback} from './YQLTable/YQLTable';
import CancelHelper from '../../../utils/cancel-helper';
import {injectQueryResults} from '../../../store/actions/queries/queryResult';

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
    onShowPreview: ShowPreviewCallback;
}) {
    const mode = result?.settings?.viewMode;
    const {start, end, total, truncated} = getResultRowsInfo(result);
    const fullResult = result.meta.full_result;
    return (
        <>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Scheme}>
                <YQLSchemeTable result={result} />
            </NotRenderUntilFirstVisible>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Table}>
                <Flex alignItems="center" gap={2} className={b('result-info')}>
                    <Text>
                        Rows {start}-{end} of {total}
                        {`${truncated ? ' (truncated)' : ''}`}
                    </Text>

                    {fullResult && (
                        <Link
                            href={`/${fullResult.cluster}/navigation?path=//${fullResult.table_path}`}
                            target="_blank"
                        >
                            <Flex alignItems="center" gap={1}>
                                <Icon data={ArrowUpRightFromSquareIcon} size={16} /> View full
                                result
                            </Flex>
                        </Link>
                    )}
                </Flex>
                <ResultsTable result={result} onShowPreview={onShowPreview} />
            </NotRenderUntilFirstVisible>
        </>
    );
}

export const QueryResultsView = React.memo(
    function QueryResultsView({query, index}: {query: QueryItem; index: number}) {
        const result = useSelector((state: RootState) => getQueryResult(state, query.id, index));
        const page = result?.page;
        const {pageSize} = useSelector((state: RootState) =>
            getQueryResultSettings(state, query.id, index),
        );

        const {onShowPreview} = useShowPreviewHandler({
            queryId: query.id,
            resultIndex: index,
            page,
            pageSize,
        });

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
                        <QueryReadyResultView result={result} onShowPreview={onShowPreview} />
                        {result.settings.viewMode === QueryResultsViewMode.Table && (
                            <ResultPaginator
                                className={b('pagination')}
                                queryId={query.id}
                                resultIndex={index}
                            />
                        )}
                    </>
                )}
                {result?.state === QueryResultState.Error && <YTErrorBlock error={result.error} />}
            </div>
        );
    },
    (prev, next) => prev.query.id === next.query.id && prev.index === next.index,
);

function useShowPreviewHandler({
    queryId,
    resultIndex,
    page,
    pageSize,
}: {
    queryId: string;
    resultIndex: number;
    page?: number;
    pageSize: number;
}) {
    const dispatch = useDispatch();

    const {dataHandler, onShowPreview} = React.useMemo(() => {
        const cancelHelper = new CancelHelper();

        const dataHandler = {
            onStartLoading: () => {},
            onSuccess: ({columnName, rowIndex, data}) => {
                dispatch(
                    injectQueryResults({
                        queryId,
                        resultIndex,
                        columnName,
                        rowIndex,
                        data,
                    }),
                );
            },
            onError: onErrorTableCellPreview,

            cancelHelper,
            saveCancellation: (token) => {
                cancelHelper.saveCancelToken(token);
            },
            page,
            pageSize,
        } as CellDataHandlerQueries & {
            cancelHelper: CancelHelper;
            page: number;
            pageSize: number;
        };

        const onShowPreview = async (
            columnName: string,
            rowIndex: number,
            tag: string | undefined,
        ) => {
            const allowInlinePreview = isInlinePreviewAllowed(tag);
            const {page, pageSize} = dataHandler;
            await dispatch(
                onCellPreviewQueryResults(
                    queryId,
                    resultIndex,
                    {
                        columnName,
                        rowIndex,
                        page,
                        pageSize,
                    },
                    allowInlinePreview ? dataHandler : undefined,
                ),
            );
        };

        return {dataHandler, onShowPreview};
    }, [queryId, resultIndex, page, pageSize, dispatch]);

    React.useEffect(() => {
        return () => {
            dataHandler.cancelHelper.removeAllRequests();
        };
    }, [dataHandler]);

    return {onShowPreview};
}
