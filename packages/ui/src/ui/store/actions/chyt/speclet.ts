import {ThunkAction} from 'redux-thunk';

import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {ChytCliqueSpecletAction} from '../../../store/reducers/chyt/speclet';
import {RootState} from '../../../store/reducers';
import {getCluster, isDeveloper} from '../../../store/selectors/global';
import {chytApiAction} from './api';
import {CHYT_SPECLET} from '../../../constants/chyt-page';

type SpecletThunkAction = ThunkAction<Promise<void>, RootState, unknown, ChytCliqueSpecletAction>;

const cancelHelper = new CancelHelper();

export function chytLoadCliqueSpeclet(alias: string): SpecletThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);
        dispatch({type: CHYT_SPECLET.REQUEST, data: {dataAlias: ''}});

        return chytApiAction(
            'describe_options',
            cluster,
            {alias},
            {
                isAdmin,
                cancelToken: cancelHelper.removeAllAndGenerateNextToken(),
                skipErrorToast: true,
            },
        )
            .then((data) => {
                dispatch({type: CHYT_SPECLET.SUCCESS, data: {data: data.result, dataAlias: alias}});
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({type: CHYT_SPECLET.FAILURE, data: {error}});
                }
            });
    };
}

export function chytSetOptions(
    alias: string,
    options: Record<string, unknown>,
): SpecletThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);

        return chytApiAction('set_options', cluster, {alias, options}, {isAdmin}).then(() => {
            dispatch(chytLoadCliqueSpeclet(alias));
        });
    };
}
