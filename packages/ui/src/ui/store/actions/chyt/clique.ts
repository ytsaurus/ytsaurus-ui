import {ThunkAction} from 'redux-thunk';

import {CHYT_CLIQUE} from '../../../constants/chyt-page';
import {RootState} from '../../../store/reducers';
import {ChytCliqueAction} from '../../../store/reducers/chyt/clique';
import {getCluster} from '../../../store/selectors/global';
import {chytApiAction} from './api';

type ChytCliqueThunkAction<T = void> = ThunkAction<T, RootState, unknown, ChytCliqueAction>;

export function chytCliqueLoad(alias: string): ChytCliqueThunkAction {
    return (dispatch, getState) => {
        dispatch({type: CHYT_CLIQUE.REQUEST, data: {currentClique: alias}});

        const cluster = getCluster(getState());
        return chytApiAction('status', cluster, {alias}).then((data) => {
            dispatch({type: CHYT_CLIQUE.SUCCESS, data: {data: data.result}});
        });
    };
}
