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

export type ChytCliqueActionParams =
    | {action: 'start'; alias: string}
    | {action: 'stop'; alias: string}
    | {action: 'remove'; alias: string}
    | {
          action: 'create';
          alias: string;
      }
    | {action: 'set_options'; alias: string; options: CliqueOptions};

export type CliqueOptions = {
    instance_count: number;
    instance_cpu: number;
    instance_total_memory: number;
    pool: string;
};

export function chytCliqueAction<DataT = void, T extends ChytCliqueActionParams['action'] = never>(
    action: T,
    params: Omit<ChytCliqueActionParams & {action: T}, 'action'>,
    {skipLoadList}: {skipLoadList?: boolean} = {},
): ChytListThunkAction<DataT> {
    return (dispatch, getState) => {
        const cluster = getCluster(getState());
        const extras = action === 'start' ? {untracked: true} : undefined;

        return wrapApiPromiseByToaster(
            axios.request<DataT>({
                method: 'POST',
                url: `/api/chyt/${cluster}/${action}`,
                data: {
                    params: {...params, ...extras},
                },
            }),
            {
                toasterName: `clique-${action}`,
                skipSuccessToast: true,
                errorTitle: `Failed to ${action} clique`,
            },
        ).then(({data}) => {
            if (!skipLoadList) {
                dispatch(loadChytList());
            }
            return data;
        });
    };
}

export function chytCliqueCreate(params: {
    alias: string;
    instance_count: number;
    instance_cpu: number;
    instance_total_memory: number;
    pool: string;
    runAfterCreation: boolean;
}): ChytListThunkAction {
    return (dispatch) => {
        const {alias, runAfterCreation, ...options} = params;
        return dispatch(chytCliqueAction('create', {alias}, {skipLoadList: true})).then(() => {
            return dispatch(
                chytCliqueAction('set_options', {alias, options}, {skipLoadList: true}),
            ).then(() => {
                if (runAfterCreation) {
                    return dispatch(chytCliqueAction('start', {alias}));
                } else {
                    return dispatch(loadChytList());
                }
            });
        });
    };
}
