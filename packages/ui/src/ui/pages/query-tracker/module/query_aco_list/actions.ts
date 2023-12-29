import {ThunkAction} from 'redux-thunk';
import {Action} from 'redux';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import type {ActionD} from '../../../../types';
import type {QueryACOListState} from './reducer';

export const QUERY_ACO_LIST_LOADING = 'query-tracker/QUERY_ACO_LIST_LOADING';
export type QueryACOListLoadingAction = Action<typeof QUERY_ACO_LIST_LOADING>;

export const QUERY_ACO_LIST_ERROR = 'query-tracker/QUERY_ACO_LIST_ERROR';
export type QueryACOListLoadingError = Action<typeof QUERY_ACO_LIST_ERROR>;

export const QUERY_ACO_LIST_SUCCESS = 'query-tracker/QUERY_ACO_LIST_SUCCESS';
export type QueryACOListLoadingSuccess = ActionD<
    typeof QUERY_ACO_LIST_SUCCESS,
    QueryACOListState['list']
>;

export const getQueryACOList = (): ThunkAction<Promise<unknown>, any, any, any> => {
    return (dispatch) => {
        dispatch({type: QUERY_ACO_LIST_LOADING});

        return ytApiV3Id
            .list(YTApiId.listQueries, {
                path: '//sys/access_control_object_namespaces/queries',
            })
            .then((data) => {
                dispatch({
                    type: QUERY_ACO_LIST_SUCCESS,
                    data,
                });
            })
            .catch((error) => {
                dispatch({type: QUERY_ACO_LIST_ERROR, data: {error}});
            });
    };
};

export type QueryACOActions =
    | QueryACOListLoadingAction
    | QueryACOListLoadingError
    | QueryACOListLoadingSuccess;
