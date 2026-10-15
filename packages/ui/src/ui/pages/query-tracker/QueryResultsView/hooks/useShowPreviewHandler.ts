import React from 'react';
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
    const cancelHelper = React.useMemo(() => new CancelHelper(), []);
    const cancelPreviews = React.useCallback(
        () => cancelHelper.removeAllRequests(),
        [cancelHelper],
    );

    const onShowPreview = React.useCallback(
        async (resultIndex: number, columnName: string, rowIndex: number, tag?: string) => {
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
                    // Modal requests retain their own cancellation and also follow this query.
                    allowInlinePreview ? undefined : cellDataHandler.saveCancellation,
                ),
            );
        },
        [queryId, dispatch, cancelHelper],
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
