import {CancelTokenSource} from 'axios';

import type {YTError} from '../../../@types/types';

import type {ReadTableResult} from '../../store/actions/navigation/content/table/readTable';
import type {QueryResult} from '../../store/actions/queries/api';
import {wrapApiPromiseByToaster} from '../../utils/utils';

export type CellDataHandler<DataT> = {
    saveCancellation: (token: CancelTokenSource) => void;
    onStartLoading: (d: {columnName: string; rowIndex: number}) => void;
    onSuccess: (d: {columnName: string; rowIndex: number; data: DataT}) => void;
    onError: (d: {columnName: string; rowIndex: number; error: YTError}) => void;
};

export type CellDataHandlerNavigation = CellDataHandler<ReadTableResult>;
export type CellDataHandlerQueries = CellDataHandler<QueryResult>;

export function isInlinePreviewAllowed(tag: string | undefined) {
    return tag?.startsWith('audio/') || tag?.startsWith('image/');
}

export const onErrorTableCellPreview: CellDataHandler<unknown>['onError'] = ({
    error,
    columnName,
    rowIndex,
}) => {
    wrapApiPromiseByToaster(Promise.reject(error), {
        toasterName: `incomplete_cell_${columnName}_${rowIndex}`,
        errorContent: `Failed to load cell data: ${JSON.stringify({columnName, rowIndex})}`,
    });
};
