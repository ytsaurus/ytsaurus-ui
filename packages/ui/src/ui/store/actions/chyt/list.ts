import axios from 'axios';
import type {ThunkAction} from 'redux-thunk';
import moment from 'moment';

import type {RootState} from '../../reducers';
import type {ChytListAction} from '../../reducers/chyt/list';
import {CHYT_LIST} from '../../../constants/chyt-page';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {getCluster} from '../../../store/selectors/global';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

type ChytListThunkAction<T = void> = ThunkAction<Promise<T>, RootState, unknown, ChytListAction>;

const cancelHelper = new CancelHelper();

export type ChytListResponse = {
    result: Array<ChytListResponseItem>;
};

export type ChytListResponseItem = {
    $value: string;
    $attributes?: {
        creator?: string;
        instance_count?: number;
        start_time?: string;
        state?: 'active' | 'broken';
        total_cpu?: number;
        total_memory?: number;
    };
};

export function loadChytList(): ChytListThunkAction {
    return (dispatch, getState) => {
        const cluster = getCluster(getState());

        dispatch({type: CHYT_LIST.REQUEST});

        return axios
            .request<ChytListResponse>({
                url: `/api/chyt/${cluster}/list`,
                method: 'POST',
                cancelToken: cancelHelper.generateNextToken(),
                data: {
                    params: {
                        attributes: [
                            'creator',
                            'state',
                            'start_time',
                            'instance_count',
                            'total_memory',
                            'total_cpu',
                        ],
                    },
                },
            })
            .then(({data}) => {
                const items = data?.result?.map(({$value, $attributes = {}}) => {
                    const {start_time} = $attributes;
                    const startTime = moment(start_time).valueOf();
                    return {
                        alias: $value,
                        duration: isNaN(startTime) ? undefined : Date.now() - startTime,
                        ...$attributes,
                    };
                });

                dispatch({type: CHYT_LIST.SUCCESS, data: {data: {items}}});
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({type: CHYT_LIST.FAILURE, data: {error}});
                }
            });
    };
}

export function chytCliqueAction(
    action: 'start' | 'stop' | 'remove',
    alias: string,
): ChytListThunkAction {
    return (dispatch, getState) => {
        const cluster = getCluster(getState());

        const extras = action === 'start' ? {untracked: true} : undefined;

        return wrapApiPromiseByToaster(
            axios.request({
                method: 'POST',
                url: `api/chyt/${cluster}/${action}`,
                data: {
                    params: {alias, ...extras},
                },
            }),
            {
                toasterName: `clique-${action}-${alias}`,
                skipSuccessToast: true,
                errorTitle: `Failed to ${action} clique`,
            },
        ).then(() => {
            dispatch(loadChytList());
        });
    };
}
