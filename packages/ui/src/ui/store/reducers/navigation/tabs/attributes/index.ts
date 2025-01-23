import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {produce} from 'immer';

import {YTError} from '../../../../../../@types/types';
import {mergeStateOnClusterChange} from '../../../utils';

export interface AttributesState {
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

const initialState: AttributesState = {
    attributes: {},
};

const attributesSlice = createSlice({
    name: 'attributes',
    initialState,
    reducers: {
        onRequest(state: AttributesState) {
            return produce(state, (draft: AttributesState) => {
                draft.loading = true;
            });
        },
        onSuccess(
            state: AttributesState,
            action: PayloadAction<Pick<AttributesState, 'attributes'>>,
        ) {
            return produce(state, (draft: AttributesState) => {
                draft.attributes = action.payload.attributes;
                draft.loading = false;
                draft.loaded = true;
            });
        },
        onFailure(state: AttributesState, action: PayloadAction<Pick<AttributesState, 'error'>>) {
            return produce(state, (draft: AttributesState) => {
                draft.error = action.payload.error;
            });
        },
    },
});

export const attributesActions = attributesSlice.actions;
export const attributes = mergeStateOnClusterChange(initialState, {}, attributesSlice.reducer);
