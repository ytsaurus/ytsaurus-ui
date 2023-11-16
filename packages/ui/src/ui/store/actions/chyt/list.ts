import type {ThunkAction} from 'redux-thunk';
import moment from 'moment';

import type {RootState} from '../../reducers';
import type {ChytListAction} from '../../reducers/chyt/list';
import {CHYT_LIST} from '../../../constants/chyt-page';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {getCluster, isDeveloper} from '../../../store/selectors/global';

import {ChytApi, chytApiAction} from './api';

type ChytListThunkAction<T> = ThunkAction<Promise<T>, RootState, unknown, ChytListAction>;

const cancelHelper = new CancelHelper();

export function chytLoadList(): ChytListThunkAction<void> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);

        dispatch({type: CHYT_LIST.REQUEST});

        return chytApiAction(
            'list',
            cluster,
            {
                attributes: [
                    'yt_operation_id',
                    'creator',
                    'instance_count',
                    'total_cpu',
                    'total_memory',
                    'health',
                    'state',
                    'creation_time',
                ],
            },
            {isAdmin, cancelToken: cancelHelper.removeAllAndGenerateNextToken()},
        )
            .then((data) => {
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

export function chytListAction<
    T extends ChytApi['action'],
    ApiItem extends ChytApi & {action: T} = ChytApi & {action: T},
>(
    action: T,
    params: ApiItem['params'],
    {skipLoadList}: {skipLoadList?: boolean} = {},
): ChytListThunkAction<ApiItem['response']> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);

        return chytApiAction(action, cluster, params, {isAdmin}).then((d) => {
            if (!skipLoadList) {
                dispatch(chytLoadList());
            }
            return d;
        });
    };
}

export function chytCliqueCreate(params: {
    alias: string;
    instance_count: number;
    pool: string;
    runAfterCreation: boolean;
}): ChytListThunkAction<void> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);

        const {alias, runAfterCreation, pool, instance_count} = params;
        return chytApiAction(
            'create',
            cluster,
            {alias, speclet_options: {active: runAfterCreation, pool, instance_count}},
            {isAdmin, successTitle: `${alias} clique created`},
        ).finally(() => {
            dispatch(chytLoadList());
        });
    };
}
