import {type ThunkAction} from 'redux-thunk';

import {CHYT_CLIQUE} from '../../../constants/chyt-page';
import {type RootState} from '../../../store/reducers';
import {type ChytCliqueAction} from '../../../store/reducers/chyt/clique';
import {selectCluster} from '../../../store/selectors/global';
import {selectIsAdmin} from '../../../store/selectors/global/is-developer';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {chytApiAction} from '../../../utils/strawberryControllerApi';

type ChytCliqueThunkAction<T = void> = ThunkAction<T, RootState, unknown, ChytCliqueAction>;

const cancelHelper = new CancelHelper();

export function chytCliqueLoad(alias: string): ChytCliqueThunkAction {
    return (dispatch, getState) => {
        dispatch({type: CHYT_CLIQUE.REQUEST, data: {currentClique: alias}});
        const state = getState();
        const cluster = selectCluster(state);
        const isAdmin = selectIsAdmin(state);
        return chytApiAction(
            'get_brief_info',
            cluster,
            {alias},
            {
                isAdmin,
                cancelToken: cancelHelper.removeAllAndGenerateNextToken(),
                skipErrorToast: true,
            },
        )
            .then((data) => {
                dispatch({type: CHYT_CLIQUE.SUCCESS, data: {data: data.result}});
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({type: CHYT_CLIQUE.FAILURE, data: {error}});
                }
            });
    };
}

export function chytResetCurrentClique(): ChytCliqueAction {
    return {type: CHYT_CLIQUE.PARTITION, data: {currentClique: ''}};
}
