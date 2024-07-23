import {getCurrentUserName} from '../../../store/selectors/global';
import {GLOBAL_PARTIAL} from '../../../constants/global';
import UIFactory from '../../../UIFactory';
import {YTThunkAction} from '.';

export function loadAllowedExperimentalPages(): YTThunkAction {
    return (dispatch, getState) => {
        const login = getCurrentUserName(getState());
        return UIFactory.getAllowedExperimentalPages(login).then((allowedExperimentalPages) => {
            dispatch({type: GLOBAL_PARTIAL, data: {allowedExperimentalPages}});
        });
    };
}
