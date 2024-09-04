import {ThunkAction} from 'redux-thunk';

import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {ChytCliqueSpecletAction} from '../../reducers/chyt/speclet';
import {RootState} from '../../reducers';
import {getCluster} from '../../selectors/global';
import {isDeveloper} from '../../selectors/global/is-developer';
import {chytApiAction} from '../../../utils/strawberryControllerApi';
import {CHYT_SPECLET} from '../../../constants/chyt-page';

type OptionsThunkAction = ThunkAction<Promise<void>, RootState, unknown, ChytCliqueSpecletAction>;

const cancelHelper = new CancelHelper();

export function chytLoadCliqueSpeclet(alias: string): OptionsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);

        return chytApiAction(
            'get_speclet',
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
