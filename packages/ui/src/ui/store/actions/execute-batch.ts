import concat_ from 'lodash/concat';
import filter_ from 'lodash/filter';

import {YTApiIdType} from '../../../shared/constants/yt-api-id';
import {getBatchError} from '../../../shared/utils/error';

import {getBatchErrorIndices} from '../../utils/utils';
import {YTError} from '../../types';
import {ExecuteBatchAction, HandleExecuteBatchRetryParams} from '../reducers/execute-batch';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../reducers';
import {
    EXECUTE_BATCH_RETRY_HIDE_MODAL,
    EXECUTE_BATCH_RETRY_SHOW_MODAL,
} from '../../constants/execute-batch';
import {rumLogError} from '../../rum/rum-counter';
import {getExecuteBatchState} from '../selectors/execute-batch';
import {CancelTokenSource} from 'axios';
import {ytApiV3Id} from '../../rum/rum-wrap-api';
import {BatchResultsItem, BatchSubRequest} from '../../../shared/yt-types';

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
    let failedRequests: Array<BatchSubRequest> = [];
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
                const error = isBatchError(e) ? e.error : e;
                // eslint-disable-next-line no-console
                console.error(error);
                throw error;
            }

            if (isBatchError<T>(e)) {
                const {error, failed_requests, successful_results} = e;
                results = results.concat(successful_results || []);
                innerErrors = innerErrors.concat(error?.inner_errors || []);
                failedRequests = failedRequests.concat(failed_requests || []);
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

    if (failedRequests.length) {
        const error = {
            message: 'Failed sub-requests:',
            inner_errors: innerErrors,
        };

        const tmp = await handleFailedRequests<T>(id, failedRequests, error, options);
        return results.concat(tmp);
    }

    return results;
}

const BATCH_ERROR_TYPE = {type: 'BATCH_ERROR_TYPE'};

interface BatchError<T> {
    type: typeof BATCH_ERROR_TYPE;
    error: YTError;
    failed_requests: Array<BatchSubRequest>;
    successful_results: Array<BatchResultsItem<T>>;
}

function isBatchError<T>(error: any): error is BatchError<T> {
    return error?.type === BATCH_ERROR_TYPE;
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

            throw {
                type: BATCH_ERROR_TYPE,
                error,
                failed_requests,
                successful_results,
            };
        }
        return results;
    } catch (e) {
        if (isBatchError<T>(e)) {
            throw e;
        } else {
            throw {
                type: BATCH_ERROR_TYPE,
                error: getBatchError([{error: e as any}], options.errorTitle),
                failed_requests: requests,
                successful_results: [],
            };
        }
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
        const {rejectCb, error} = getExecuteBatchState(getState())[id];
        rejectCb!(error);
        dispatch(hideExecuteBatchRetryModal(id));
    };
}

export function skipExecuteBatch(id: string): ExecuteBatchThunkAction {
    return (dispatch, getState) => {
        const {resolveCb} = getExecuteBatchState(getState())[id];
        resolveCb!([]);
        dispatch(hideExecuteBatchRetryModal(id));
    };
}

export function retryExecuteBatch(id: string): ExecuteBatchThunkAction {
    return (dispatch, getState) => {
        const item = getExecuteBatchState(getState())[id];
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
