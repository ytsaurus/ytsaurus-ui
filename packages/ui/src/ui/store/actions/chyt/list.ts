import type {ThunkAction} from 'redux-thunk';

import type {RootState} from '../../reducers';
import type {ChytListAction} from '../../reducers/chyt/list';
import {CHYT_LIST} from '../../../constants/chyt-page';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {getCluster} from '../../../store/selectors/global';
import {isDeveloper} from '../../../store/selectors/global/is-developer';
import {getChytListVisibleColumns} from '../../../store/selectors/chyt';

import {StrawberryApi, chytApiAction} from '../../../utils/strawberryControllerApi';
import {SettingsThunkAction, setSettingByKey} from '../settings';

type ChytListThunkAction<T> = ThunkAction<Promise<T>, RootState, unknown, ChytListAction>;

const cancelHelper = new CancelHelper();

export function chytLoadList(): ChytListThunkAction<void> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);
        const columns = getChytListVisibleColumns(state);

        dispatch({type: CHYT_LIST.REQUEST});

        const extraColumns = -1 === columns.indexOf('pool') ? ['pool' as const] : [];

        const attributesSet = new Set([
            'yt_operation_id' as const,
            'creator' as const,
            'state' as const,
            'health' as const,
            'health_reason' as const,
            ...columns,
            ...extraColumns,
        ]);

        return chytApiAction(
            'list',
            cluster,
            {attributes: [...attributesSet]},
            {isAdmin, cancelToken: cancelHelper.removeAllAndGenerateNextToken()},
        )
            .then((data) => {
                const items = data?.result?.map(({$value, $attributes = {}}) => {
                    return {
                        alias: $value,
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
    T extends StrawberryApi['action'],
    ApiItem extends StrawberryApi & {action: T} = StrawberryApi & {action: T},
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
            {
                alias,
                speclet_options: {
                    active: runAfterCreation && Boolean(pool),
                    instance_count,
                    ...(pool ? {pool} : undefined),
                },
            },
            {isAdmin, successTitle: `${alias} clique created`},
        ).finally(() => {
            dispatch(chytLoadList());
        });
    };
}

export function chytSetVisibleColumns(columns: Array<string>): SettingsThunkAction {
    return (dispatch) => {
        return dispatch(setSettingByKey('global::chyt::list_columns', columns)).then(() => {
            dispatch(chytLoadList());
        });
    };
}
