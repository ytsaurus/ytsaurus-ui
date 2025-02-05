import {ThunkAction} from 'redux-thunk';
import {UnknownAction} from '@reduxjs/toolkit';

import {RootState} from '../../../../reducers';
import {updateView} from '../..';

import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {ytApiV4} from '../../../../../rum/rum-wrap-api';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

export function remountTable(): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        const state = getState();
        const path = state.navigation.navigation.path;

        return wrapApiPromiseByToaster(ytApiV4.remountTable({path}), {
            toasterName: 'remount_tabe',
            errorTitle: 'Failed to remount table',
            skipSuccessToast: true,
        }).finally(() => {
            dispatch(updateView());
        });
    };
}
