import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {Toaster} from '@gravity-ui/uikit';
import type {AxiosError} from 'axios';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {getQueryTrackerRequestOptions} from '../query/selectors';
import {QUERY_ACO_LOADING} from './constants';
import type {ActionD} from '../../../../types';
import {showErrorPopup} from '../../../../utils/utils';
import type {QueryACOState} from './reducer';

export type QueryACOLoadingAction = Action<typeof QUERY_ACO_LOADING.REQUEST>;
export type QueryACOLoadingError = Action<typeof QUERY_ACO_LOADING.FAILURE>;
export type QueryACOLoadingSuccess = ActionD<
    typeof QUERY_ACO_LOADING.SUCCESS,
    QueryACOState['data']
>;

export type QueryACOActions = QueryACOLoadingAction | QueryACOLoadingError | QueryACOLoadingSuccess;

export const getQueryACO = (): ThunkAction<Promise<unknown>, any, any, any> => {
    return (dispatch, getState) => {
        const state = getState();
        const {stage} = getQueryTrackerRequestOptions(state);

        dispatch({type: QUERY_ACO_LOADING.REQUEST});

        return ytApiV4Id
            .getQueryTrackerInfo(YTApiId.getQueryTrackerInfo, {
                setup: {
                    transformError({
                        parsedData,
                        rawError,
                    }: {
                        parsedData: Awaited<ReturnType<typeof ytApiV4Id.getQueryTrackerInfo>>;
                        rawError: AxiosError;
                    }) {
                        if (rawError?.response?.status === 404) {
                            throw {
                                data: parsedData,
                                status: rawError?.response?.status,
                            };
                        }

                        throw parsedData;
                    },
                },
                parameters: {stage},
            })
            .then((data) => {
                dispatch({
                    type: QUERY_ACO_LOADING.SUCCESS,
                    data: {data},
                });
            })
            .catch((error) => {
                // @todo Remove the condition when the method will be implemented on all clusters
                if (error?.status !== 404) {
                    const toaster = new Toaster();
                    toaster.add({
                        name: 'aco',
                        theme: 'danger',
                        title: 'Failed to load ACO',
                        content: error?.message,
                        actions: [{label: ' Details', onClick: () => showErrorPopup(error)}],
                    });
                }

                dispatch({
                    type: QUERY_ACO_LOADING.FAILURE,
                });
            });
    };
};
