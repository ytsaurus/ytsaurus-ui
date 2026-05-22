import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {produce} from 'immer';

import {type YTError} from '../../../../../../@types/types';
import {mergeStateOnClusterChange} from '../../../utils';

export type AttributeName = string;

export type AttributeData = {
    $type: string;
    $value: string;
};

export type RequestState = {
    loading?: boolean;
    loaded?: boolean;
    error?: YTError;
};

export type LoadableAttributesRequestsState = Record<AttributeName, RequestState>;

export type AttributesState = {
    attributes: Record<AttributeName, AttributeData>;
    opaqueAttributeKeys: AttributeName[];
    attributesRequestState: RequestState;
    loadableAttributesRequestsState: LoadableAttributesRequestsState;
};

const initialState: AttributesState = {
    attributes: {},
    opaqueAttributeKeys: [],
    attributesRequestState: {},
    loadableAttributesRequestsState: {},
};

const attributesSlice = createSlice({
    name: 'attributes',
    initialState,
    reducers: {
        onAttributesRequest(state: AttributesState) {
            return produce(state, (draft: AttributesState) => {
                draft.attributesRequestState = {loading: true};
            });
        },
        onAttributesSuccess(
            state: AttributesState,
            action: PayloadAction<Pick<AttributesState, 'attributes' | 'opaqueAttributeKeys'>>,
        ) {
            return produce(state, (draft: AttributesState) => {
                draft.attributes = action.payload.attributes;
                draft.opaqueAttributeKeys = action.payload.opaqueAttributeKeys;
                draft.attributesRequestState = {loaded: true};
                draft.loadableAttributesRequestsState = {};
            });
        },
        onAttributesFailure(state: AttributesState, action: PayloadAction<{error: YTError}>) {
            const {error} = action.payload;

            return produce(state, (draft: AttributesState) => {
                draft.attributesRequestState = {error};
            });
        },
        onAttributeRequest(state: AttributesState, action: PayloadAction<{name: AttributeName}>) {
            const {name} = action.payload;

            return produce(state, (draft: AttributesState) => {
                draft.loadableAttributesRequestsState[name] = {loading: true};
            });
        },
        onAttributeSuccess(
            state: AttributesState,
            action: PayloadAction<{name: AttributeName; data: AttributeData}>,
        ) {
            const {name, data} = action.payload;

            return produce(state, (draft: AttributesState) => {
                draft.attributes[name] = data;
                draft.loadableAttributesRequestsState[name] = {loaded: true};
            });
        },
        onAttributeFailure(
            state: AttributesState,
            action: PayloadAction<{name: AttributeName; error: YTError}>,
        ) {
            const {name, error} = action.payload;

            return produce(state, (draft: AttributesState) => {
                draft.loadableAttributesRequestsState[name] = {error};
            });
        },
    },
});

export const attributesActions = attributesSlice.actions;

export const attributes = mergeStateOnClusterChange(initialState, {}, attributesSlice.reducer);
