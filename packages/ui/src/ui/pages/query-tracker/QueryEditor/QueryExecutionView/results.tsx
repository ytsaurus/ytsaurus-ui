import React, {useMemo} from 'react';
import type {QueryResultsProps} from '@gravity-ui/querieskit';
import {Flex, Text} from '@gravity-ui/uikit';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectQueryResults} from '../../../../store/selectors/query-tracker/queryResult';
import {selectPrimitiveTypesMap} from '../../../../store/selectors/global/supported-features';
import {patchQueryResultSettings} from '../../../../store/actions/query-tracker/queryResult';
import {type QueryItem} from '../../../../types/query-tracker/api';
import {QueryResultState, QueryResultsViewMode} from '../../../../types/query-tracker/queryResult';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import {TableColumnsSelector} from '../../QueryResults/QueryResultActions/TableColumnsSelector';
import {QueryResultDownloadManager} from '../../QueryResults/QueryResultActions/QueryResultDownloadManager';
import {QueryFullResultList} from '../../QueryResultsView/QueryFullResultList';
import {useQueryResultsPreviewHandler} from '../../QueryResultsView/hooks/useShowPreviewHandler';
import i18n from '../../QueryResultsView/i18n';
import {prepareResult} from './adapters';

export function useResultProps(query: QueryItem) {
    const dispatch = useDispatch();
    const results = useSelector((state) => selectQueryResults(state, query.id));
    const typeMap = useSelector(selectPrimitiveTypesMap);
    const {onShowPreview} = useQueryResultsPreviewHandler({queryId: query.id});

    return useMemo(() => {
        const props: Record<number, QueryResultsProps<Record<string, unknown>>> = {};
        for (const [key, result] of Object.entries(results || {})) {
            const index = Number(key);
            const loading =
                result.state === QueryResultState.Loading || result.state === QueryResultState.Init;
            if (!result.resultReady) {
                props[index] = {
                    columns: [],
                    rows: [],
                    loading: result.state !== QueryResultState.Error,
                    errorContent:
                        result.state === QueryResultState.Error ? (
                            <YTErrorBlock error={result.error} />
                        ) : undefined,
                };
                continue;
            }
            const view =
                result.settings.viewMode === QueryResultsViewMode.Scheme ? 'schema' : 'result';
            const prepared = prepareResult(result, typeMap, view);
            const visible = result.settings.visibleColumns;
            const columns = prepared.columns;
            props[index] = {
                columns:
                    view === 'schema' || !visible
                        ? columns
                        : visible.flatMap((name) =>
                              columns.filter((column) => column.name === name),
                          ),
                rows: prepared.rows,
                formatterSettings: {
                    treatValAsData: true,
                    escapeWhitespace: false,
                    decodeUTF8: false,
                    binaryAsHex: true,
                    escapeYQLStrings: true,
                    omitStructNull: true,
                    maxListSize: 50,
                    maxStringSize: undefined,
                },
                maxVisibleLines: 5,
                collapseAfterLines: 8,
                maxInlineTextLength: 10000,
                getCellOptions: ({index: rowIndex, column}) => {
                    const cell = result.results[rowIndex]?.[column.name];
                    return {
                        isIncomplete: cell?.$incomplete,
                        tag: cell?.$tagValue,
                        copyText: cell?.$rawValue,
                        // Preview may have loaded a complete list longer than the initial limit.
                        formatterSettings: {
                            maxListSize: cell && !cell.$incomplete ? undefined : 50,
                        },
                    };
                },
                onCellPreview: ({index: rowIndex, column, tag}) =>
                    onShowPreview(index, column.name, rowIndex, tag),
                totalRows: result.meta.data_statistics.row_count,
                loading,
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
                actions:
                    view === 'result' ? (
                        <Flex gap={2}>
                            <TableColumnsSelector
                                allColumns={result.columns}
                                columns={visible}
                                onChange={(visibleColumns) =>
                                    dispatch(
                                        patchQueryResultSettings(query.id, index, {visibleColumns}),
                                    )
                                }
                            />
                            <QueryResultDownloadManager
                                queryId={query.id}
                                resultIndex={index}
                                allColumns={result.columns}
                                visibleColumns={visible}
                            />
                        </Flex>
                    ) : undefined,
            };
        }
        return props;
    }, [dispatch, query.id, query.engine, results, typeMap, onShowPreview]);
}
