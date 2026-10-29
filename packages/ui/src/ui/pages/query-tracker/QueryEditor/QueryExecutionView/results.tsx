import React, {useMemo} from 'react';
import type {QueryResultsProps} from '@gravity-ui/querieskit';
import {Button, Flex, Text} from '@gravity-ui/uikit';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectQueryResults} from '../../../../store/selectors/query-tracker/queryResult';
import {selectPrimitiveTypesMap} from '../../../../store/selectors/global/supported-features';
import {
    loadNextQueryResult,
    loadQueryResult,
    patchQueryResultSettings,
} from '../../../../store/actions/query-tracker/queryResult';
import {type QueryItem} from '../../../../types/query-tracker/api';
import {QueryResultState, QueryResultsViewMode} from '../../../../types/query-tracker/queryResult';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import {QueryResultDownloadManager} from '../../QueryResults/QueryResultActions/QueryResultDownloadManager';
import {QueryFullResultList} from '../../QueryResultsView/QueryFullResultList';
import {useQueryResultsPreviewHandler} from '../../QueryResultsView/hooks/useShowPreviewHandler';
import i18n from '../../QueryResultsView/i18n';
import {prepareResultColumns} from './adapters';
import {sourceResultCellSettings} from '../../../../utils/query-tracker/resultCellSettings';
import type {SourceQueryResultReadyState as QueryResultReadyState} from '../../../../types/query-tracker/queryResult';
import executionI18n from './i18n';

export function useResultProps(query: QueryItem | undefined, active: boolean, activeTab: string) {
    const dispatch = useDispatch();
    const results = useSelector((state) => selectQueryResults(state, query?.id || ''));
    const typeMap = useSelector(selectPrimitiveTypesMap);
    const {onShowPreview} = useQueryResultsPreviewHandler({queryId: query?.id || ''});

    return useMemo(() => {
        const props: Record<
            number,
            QueryResultsProps<QueryResultReadyState['results'][number]>
        > = {};
        if (!query?.id) return props;
        for (const [key, result] of Object.entries(results || {})) {
            const index = Number(key);
            const loading =
                result.state === QueryResultState.Loading || result.state === QueryResultState.Init;
            if (!result.resultReady || result.rowOffset !== 0) {
                props[index] = {
                    columns: [],
                    rows: [],
                    loading: result.state !== QueryResultState.Error,
                    errorContent:
                        result.state === QueryResultState.Error ? (
                            <Flex direction="column" gap={2}>
                                <YTErrorBlock error={result.error} />
                                <Button
                                    onClick={() =>
                                        dispatch(
                                            loadQueryResult(query.id, index, {fromStart: true}),
                                        )
                                    }
                                >
                                    {executionI18n('action_charts-retry')}
                                </Button>
                            </Flex>
                        ) : undefined,
                };
                continue;
            }
            const view =
                result.settings.viewMode === QueryResultsViewMode.Scheme ? 'schema' : 'result';
            const visible = result.settings.visibleColumns;
            const showControls = active && activeTab === `result/${index}`;
            props[index] = {
                columns: prepareResultColumns(result, typeMap),
                rows: result.results,
                ...sourceResultCellSettings,
                rowKey: (row) => row.sourceIndex,
                onCellPreview: ({row, column, tag}) =>
                    onShowPreview(index, column.name, row.sourceIndex, tag),
                totalRows: result.meta.data_statistics.row_count,
                loading: false,
                view,
                onViewChange: (next) =>
                    dispatch(
                        patchQueryResultSettings(query.id, index, {
                            viewMode:
                                next === 'schema'
                                    ? QueryResultsViewMode.Scheme
                                    : QueryResultsViewMode.Table,
                        }),
                    ),
                toolbarContent: (
                    <Flex direction="column" gap={1}>
                        {result.meta.is_truncated && (
                            <Text color="secondary">{i18n('context_rows-truncated')}</Text>
                        )}
                        {result.meta.full_result && (
                            <QueryFullResultList
                                fullResult={result.meta.full_result}
                                engine={query.engine}
                            />
                        )}
                    </Flex>
                ),
                pagination: showControls
                    ? {
                          hasMore: result.results.length < result.meta.data_statistics.row_count,
                          loading,
                          onLoadMore: () => dispatch(loadNextQueryResult(query.id, index)),
                      }
                    : undefined,
                columnVisibility: showControls
                    ? {
                          value: visible,
                          onChange: (visibleColumns) =>
                              dispatch(patchQueryResultSettings(query.id, index, {visibleColumns})),
                      }
                    : undefined,
                actions:
                    view === 'result' && showControls ? (
                        <QueryResultDownloadManager
                            queryId={query.id}
                            resultIndex={index}
                            allColumns={result.columns}
                            visibleColumns={visible}
                        />
                    ) : undefined,
            };
        }
        return props;
    }, [dispatch, query, results, typeMap, onShowPreview, active, activeTab]);
}
