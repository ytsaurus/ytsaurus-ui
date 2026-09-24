import concat_ from 'lodash/concat';
import filter_ from 'lodash/filter';

import {type YTApiIdType} from '../../../shared/constants/yt-api-id';
import {getBatchError} from '../../../shared/utils/error';

import {getBatchErrorIndices} from '../../utils/utils';
import {type YTError} from '../../types';
import {
    type ExecuteBatchAction,
    type HandleExecuteBatchRetryParams,
} from '../reducers/execute-batch';
import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../reducers';
import {
    EXECUTE_BATCH_RETRY_HIDE_MODAL,
    EXECUTE_BATCH_RETRY_SHOW_MODAL,
} from '../../constants/execute-batch';
import {rumLogError} from '../../rum/rum-counter';
import {selectExecuteBatchState} from '../selectors/execute-batch';
import {type CancelTokenSource} from 'axios';
import {ytApiV3Id} from '../../rum/rum-wrap-api';
import {type BatchResultsItem, type BatchSubRequest} from '../../../shared/yt-types';

const MAX_REQUESTS_COUNT_PER_BATCH = 100;

export interface ExecuteBatchOptions {
    saveCancelSourceCb?: (source: CancelTokenSource) => void;
    disableSkip?: boolean;
    allowRetries?: boolean;
    errorTitle: string;
}

/**
 * The function splits requests-parameter to smaller sub-arrays and handles them sequentially.
 * Also by default if !Boolean(options?.abortOnFirstError) it displays dialog with
 * ability to retry (or skip) only failed requests.
 * @param requests
 * @param options
 */
export async function executeBatchWithRetries<T>(
    id: YTApiIdType,
    requests: Array<BatchSubRequest>,
    options: ExecuteBatchOptions,
): Promise<Array<BatchResultsItem<T>>> {
    let results: Array<BatchResultsItem<T>> = [];
    let failedRequestsToRetry: Array<BatchSubRequest> = [];
    let innerErrors: Array<YTError> = [];
    for (let i = 0; i < requests.length; i += MAX_REQUESTS_COUNT_PER_BATCH) {
        const from = i;
        const to = from + MAX_REQUESTS_COUNT_PER_BATCH;

        const current = requests.slice(from, to);

        try {
            const tmp = await handleBatchSlice<T>(id, current, options);
            results = concat_(results, tmp);
        } catch (err) {
            const e = err as any;
            if (!options?.allowRetries) {
                const error = isBatchSliceError(e) ? e.error : e;
                // eslint-disable-next-line no-console
                console.error(error);
                throw error;
            }

            if (isBatchSliceError<T>(e)) {
                const {error, failedRequests, successfulResults} = e;
                results = results.concat(successfulResults || []);
                innerErrors = innerErrors.concat(error?.inner_errors || []);
                failedRequestsToRetry = failedRequestsToRetry.concat(failedRequests || []);
            } else {
                rumLogError(
                    {
                        message: 'execute-batch with retries failed',
                    },
                    e,
                );
                throw new Error('Unexpected error during executeBatchWithRetries');
            }
        }
    }

    if (failedRequestsToRetry.length) {
        const error = {
            message: 'Failed sub-requests:',
            inner_errors: innerErrors,
        };

        const tmp = await handleFailedRequests<T>(id, failedRequestsToRetry, error, options);
        return results.concat(tmp);
    }

    return results;
}

type BatchSliceErrorParams<T> = {
    error: YTError | undefined;
    failedRequests: Array<BatchSubRequest>;
    successfulResults: Array<BatchResultsItem<T>>;
};

class BatchSliceError<T> extends Error {
    error: YTError | undefined;
    failedRequests: Array<BatchSubRequest>;
    successfulResults: Array<BatchResultsItem<T>>;

    constructor({error, failedRequests, successfulResults}: BatchSliceErrorParams<T>) {
        super();

        this.error = error;
        this.failedRequests = failedRequests;
        this.successfulResults = successfulResults;
    }
}

function isBatchSliceError<T>(error: unknown): error is BatchSliceError<T> {
    return error instanceof BatchSliceError;
}

async function handleBatchSlice<T>(
    id: YTApiIdType,
    requests: Array<BatchSubRequest>,
    options: ExecuteBatchOptions,
): Promise<Array<BatchResultsItem<T>>> {
    try {
        const results: Array<BatchResultsItem<T>> = await ytApiV3Id.executeBatch(id, {
            parameters: {requests},
            cancellation: options?.saveCancelSourceCb,
        });
        const error = getBatchError(results, options.errorTitle);
        if (error) {
            const errorIndices = new Set(getBatchErrorIndices(results));
            const successful_results = filter_(results, (_item, index) => {
                return !errorIndices.has(index);
            });
            const failed_requests = filter_(requests, (_item, index) => {
                return errorIndices.has(index);
            });

            throw new BatchSliceError({
                error,
                failedRequests: failed_requests,
                successfulResults: successful_results,
            });
        }
        return results;
    } catch (e) {
        if (isBatchSliceError(e)) {
            throw e;
        }

        throw new BatchSliceError({
            error: getBatchError([{error: e as any}], options.errorTitle),
            failedRequests: requests,
            successfulResults: [],
        });
    }
}

async function handleFailedRequests<T>(
    id: YTApiIdType,
    requests: Array<BatchSubRequest> = [],
    error: YTError,
    options: ExecuteBatchOptions,
): Promise<Array<BatchResultsItem<T>>> {
    return new Promise((res, rej) => {
        (window as any).store.dispatch(
            showExecuteBatchRetryModal(id, {
                failed_requests: requests,
                error,
                resolveCb: res,
                rejectCb: rej,
                options,
            }),
        );
    });
}

type ExecuteBatchThunkAction = ThunkAction<any, RootState, any, ExecuteBatchAction>;

let batchCounter = -1;
function makeId() {
    return `batch_id_${++batchCounter}`;
}

function showExecuteBatchRetryModal(
    ytApiId: YTApiIdType,
    params: HandleExecuteBatchRetryParams,
): ExecuteBatchThunkAction {
    return (dispatch) => {
        dispatch({
            type: EXECUTE_BATCH_RETRY_SHOW_MODAL,
            data: {...params, id: makeId(), ytApiId},
        });
    };
}

export function hideExecuteBatchRetryModal(id: string): ExecuteBatchThunkAction {
    return (dispatch) => {
        dispatch({type: EXECUTE_BATCH_RETRY_HIDE_MODAL, data: {id}});
    };
}

export function abortExecuteBatch(id: string): ExecuteBatchThunkAction {
    return (dispatch, getState) => {
        const {rejectCb, error} = selectExecuteBatchState(getState())[id];
        rejectCb!(error);
        dispatch(hideExecuteBatchRetryModal(id));
    };
}

export function skipExecuteBatch(id: string): ExecuteBatchThunkAction {
    return (dispatch, getState) => {
        const {resolveCb} = selectExecuteBatchState(getState())[id];
        resolveCb!([]);
        dispatch(hideExecuteBatchRetryModal(id));
    };
}

export function retryExecuteBatch(id: string): ExecuteBatchThunkAction {
    return (dispatch, getState) => {
        const item = selectExecuteBatchState(getState())[id];
        if (!item) {
            rumLogError({
                message: `executeBatch with retries, store does not contain any elements with id=${id}`,
            });
            return;
        }

        dispatch(hideExecuteBatchRetryModal(id));
        const {failed_requests, options, resolveCb, rejectCb, ytApiId} = item;

        return executeBatchWithRetries(ytApiId, failed_requests, options)
            .then((res) => {
                resolveCb(res);
            })
            .catch((e) => {
                rejectCb(e);
            });
    };
}
