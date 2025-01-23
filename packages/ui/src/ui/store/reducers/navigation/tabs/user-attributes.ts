import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../../@types/types';
import {mergeStateOnClusterChange} from '../../utils';

export interface UserAttributesState {
    attributes: {
        [key: string]: {
            $type: string;
            $value: string;
        };
    };
    loading?: boolean;
    loaded?: boolean;
    error?: YTError;
}

export const initialState: UserAttributesState = {
    loading: false,
    loaded: false,
    attributes: {},
};

const reducers = {
    onRequest(state: UserAttributesState) {
        return {...state, loading: true};
    },
    onSuccess(
        state: UserAttributesState,
        action: PayloadAction<Pick<UserAttributesState, 'attributes'>>,
    ) {
        const {attributes} = action.payload;
        return {
            ...state,
            attributes,
            loaded: true,
            loading: false,
        };
    },
    onFailure(
        state: UserAttributesState,
        action: PayloadAction<Pick<UserAttributesState, 'error'>>,
    ) {
        const {error} = action.payload;
        return {
            ...state,
            loading: false,
            error: error,
        };
    },
};

const userAttributesSlice = createSlice({
    name: 'userAttributes',
    initialState,
    reducers,
});

export const userAttributesActions = userAttributesSlice.actions;
export const userAttributes = mergeStateOnClusterChange(
    initialState,
    {},
    userAttributesSlice.reducer,
);
