import React from 'react';
import {useStore} from 'react-redux';
import type {RootState} from '../../../../store/reducers';
import {selectQueryResult} from '../../../../store/selectors/query-tracker/queryResult';
import {useDispatch} from '../../../../store/redux-hooks';
import {
    type CellDataHandlerQueries,
    isInlinePreviewAllowed,
    onErrorTableCellPreview,
} from '../../../../types/navigation/table-cell-preview';
import {onCellPreviewQueryResults} from '../../../../store/actions/query-tracker/cellPreview';
import CancelHelper from '../../../../utils/cancel-helper';
import {injectQueryResults} from '../../../../store/actions/query-tracker/queryResult';

type Props = {
    queryId: string;
    resultIndex: number;
};

export function useQueryResultsPreviewHandler({queryId}: Pick<Props, 'queryId'>) {
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const cancelHelper = React.useMemo(() => new CancelHelper(), []);
    const cancelPreviews = React.useCallback(
        () => cancelHelper.removeAllRequests(),
        [cancelHelper],
    );

    const onShowPreview = React.useCallback(
        async (resultIndex: number, columnName: string, rowIndex: number, tag?: string) => {
            const result = selectQueryResult(store.getState(), queryId, resultIndex);
            const expectedCell = result?.resultReady
                ? result.results.find((row) => row.sourceIndex === rowIndex)?.cells[columnName]
                : undefined;
            if (!expectedCell) return;
            const cellDataHandler: CellDataHandlerQueries = {
                onStartLoading: () => {},
                onSuccess: ({columnName: name, rowIndex: row, data}) => {
                    dispatch(
                        injectQueryResults({
                            queryId,
                            resultIndex,
                            columnName: name,
                            rowIndex: row,
                            data,
                            expectedCell,
                        }),
                    );
                },
                onError: onErrorTableCellPreview,
                saveCancellation: (token) => cancelHelper.saveCancelToken(token),
            };
            const allowInlinePreview = isInlinePreviewAllowed(tag);
            await dispatch(
                onCellPreviewQueryResults(
                    queryId,
                    resultIndex,
                    {columnName, rowIndex},
                    allowInlinePreview ? cellDataHandler : undefined,
                    allowInlinePreview ? undefined : cellDataHandler.saveCancellation,
                ),
            );
        },
        [queryId, dispatch, cancelHelper, store],
    );

    React.useEffect(() => cancelPreviews, [cancelPreviews, queryId]);

    return {onShowPreview, cancelPreviews};
}

export function useShowPreviewHandler({queryId, resultIndex}: Props) {
    const {onShowPreview: showPreview, cancelPreviews} = useQueryResultsPreviewHandler({queryId});
    React.useEffect(() => cancelPreviews, [cancelPreviews, resultIndex]);
    const onShowPreview = React.useCallback(
        (columnName: string, rowIndex: number, tag?: string) =>
            showPreview(resultIndex, columnName, rowIndex, tag),
        [showPreview, resultIndex],
    );
    return {onShowPreview};
}
