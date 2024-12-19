import {getCurrentUserName} from '../../../store/selectors/global';
import {GLOBAL_PARTIAL} from '../../../constants/global';
import UIFactory from '../../../UIFactory';
import {YTThunkAction} from '.';
import {rumLogError} from '../../../rum/rum-counter';

export function loadAllowedExperimentalPages(): YTThunkAction {
    return (dispatch, getState) => {
        const login = getCurrentUserName(getState());
        return UIFactory.getAllowedExperimentalPages(login)
            .then((allowedExperimentalPages) => {
                dispatch({type: GLOBAL_PARTIAL, data: {allowedExperimentalPages}});
            })
            .catch((error) => {
                rumLogError({message: 'Failed to get experimental pages'}, error);
                dispatch({type: GLOBAL_PARTIAL, data: {allowedExperimentalPages: []}});
            });
    };
}
