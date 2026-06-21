import {type ThunkAction} from 'redux-thunk';
import {type UnknownAction} from '@reduxjs/toolkit';

import {type RootState} from '../../../../reducers';
import {updateView} from '../..';

import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {ytApiV4} from '../../../../../rum/rum-wrap-api';
import i18n from './i18n';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

export function remountTable(): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        const state = getState();
        const path = state.navigation.navigation.path;

        return wrapApiPromiseByToaster(ytApiV4.remountTable({path}), {
            toasterName: 'remount_tabe',
            errorTitle: i18n('alert_failed-to-remount'),
            skipSuccessToast: true,
        }).finally(() => {
            dispatch(updateView());
        });
    };
}
