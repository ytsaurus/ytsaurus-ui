import {
    GET_TABLET_ERRORS,
    GET_TABLET_ERRORS_COUNT,
} from '../../../../constants/navigation/tabs/tablet-errors';
import {Action} from 'redux';
import {ActionD, YTError} from '../../../../types';

export interface TabletErrorsState {
    loading: boolean;
    loaded: boolean;
    error?: YTError;

    tabletErrors: {
        tablet_errors?: Record<string, Array<YTError>>;
        replication_errors?: Record<string, Array<YTError>>;
    };
    tabletErrorsPath: string;

    errorsCount: number;
    errorsCountPath: string;
}

export const initialState: TabletErrorsState = {
    loading: false,
    loaded: false,
    error: undefined,

    tabletErrors: {},
    tabletErrorsPath: '',

    errorsCount: 0,
    errorsCountPath: '',
};

export default (state = initialState, action: TabletErrorsAction) => {
    switch (action.type) {
        case GET_TABLET_ERRORS.REQUEST:
            return {...state, loading: true, error: undefined};
        case GET_TABLET_ERRORS.SUCCESS:
            return {...state, ...action.data, loaded: true, loading: false};
        case GET_TABLET_ERRORS.FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
        case GET_TABLET_ERRORS.CANCELLED:
            return {...state, loading: false};
        case GET_TABLET_ERRORS_COUNT:
            return {...state, ...action.data};
        default:
            return state;
    }
};

export type TabletErrorsAction =
    | Action<typeof GET_TABLET_ERRORS.REQUEST>
    | Action<typeof GET_TABLET_ERRORS.CANCELLED>
    | ActionD<typeof GET_TABLET_ERRORS.FAILURE, Pick<TabletErrorsState, 'error'>>
    | ActionD<
          typeof GET_TABLET_ERRORS.SUCCESS,
          Pick<TabletErrorsState, 'tabletErrors' | 'tabletErrorsPath'>
      >
    | ActionD<
          typeof GET_TABLET_ERRORS_COUNT,
          Pick<TabletErrorsState, 'errorsCount' | 'errorsCountPath'>
      >;
