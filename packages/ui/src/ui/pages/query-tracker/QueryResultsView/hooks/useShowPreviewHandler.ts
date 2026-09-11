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

export function useShowPreviewHandler({queryId, resultIndex}: Props) {
    const dispatch = useDispatch();

    const {dataHandler, onShowPreview} = React.useMemo(() => {
        const cancelHelper = new CancelHelper();

        const handler = {
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
        } as CellDataHandlerQueries & {cancelHelper: CancelHelper};

        const showPreview = async (
            columnName: string,
            rowIndex: number,
            tag: string | undefined,
        ) => {
            const allowInlinePreview = isInlinePreviewAllowed(tag);
            await dispatch(
                onCellPreviewQueryResults(
                    queryId,
                    resultIndex,
                    {columnName, rowIndex},
                    allowInlinePreview ? handler : undefined,
                ),
            );
        };

        return {dataHandler: handler, onShowPreview: showPreview};
    }, [queryId, resultIndex, dispatch]);

    React.useEffect(() => {
        return () => {
            dataHandler.cancelHelper.removeAllRequests();
        };
    }, [dataHandler]);

    return {onShowPreview};
}
