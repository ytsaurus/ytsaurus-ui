import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../../@types/types';
import {Reducer} from 'redux';

type TableSortMergeActionData =
    | Pick<TableSortMergeModal, 'sortVisible' | 'paths'>
    | Pick<TableSortMergeModal, 'mergeVisible' | 'paths'>
    | Pick<TableSortMergeModal, 'error'>
    | Pick<TableSortMergeModal, 'suggestColumns'>;

export const enum PathAttribute {
    OPTIMIZE_FOR = 'optimize_for',
    COMPRESSION_CODEC = 'compression_codec',
    ERASURE_CODEC = 'erasure_codec',
}

export type Attribute = {
    active: boolean;
    value: string;
    type: PathAttribute;
};

export type TableSortMergeModal = {
    sortVisible: boolean;
    mergeVisible: boolean;
    paths: Array<string>;
    outputPathAttributes: Record<PathAttribute, Attribute>;
    suggestColumns: Array<string>;
    error?: YTError;
};

const getInitialValue = (type: PathAttribute) => {
    return {active: false, value: '', type};
};

const initialState: TableSortMergeModal = {
    sortVisible: false,
    mergeVisible: false,
    paths: [],
    outputPathAttributes: {
        [PathAttribute.OPTIMIZE_FOR]: getInitialValue(PathAttribute.OPTIMIZE_FOR),
        [PathAttribute.COMPRESSION_CODEC]: getInitialValue(PathAttribute.COMPRESSION_CODEC),
        [PathAttribute.ERASURE_CODEC]: getInitialValue(PathAttribute.ERASURE_CODEC),
    },
    suggestColumns: [],
};

const tableMergeSortModalSlice = createSlice({
    name: 'tableMergeSortModal',
    initialState,
    reducers: {
        setModalPartial(state, {payload}: PayloadAction<TableSortMergeActionData>) {
            return {...state, ...payload};
        },
        setAttributeActive(
            state,
            {payload}: PayloadAction<{key: PathAttribute; isActive: boolean}>,
        ) {
            const attribute = payload.isActive
                ? {...state.outputPathAttributes[payload.key], active: true}
                : {...initialState.outputPathAttributes[payload.key]};

            return {
                ...state,
                outputPathAttributes: {
                    ...state.outputPathAttributes,
                    [payload.key]: attribute,
                },
            };
        },
        changeAttribute(state, {payload}: PayloadAction<Attribute>) {
            return {
                ...state,
                outputPathAttributes: {
                    ...state.outputPathAttributes,
                    [payload['type']]: payload,
                },
            };
        },
        resetAttributes(state) {
            return {...state, outputPathAttributes: {...initialState.outputPathAttributes}};
        },
    },
});

export const {setModalPartial, setAttributeActive, changeAttribute, resetAttributes} =
    tableMergeSortModalSlice.actions;

export default tableMergeSortModalSlice.reducer as Reducer<TableSortMergeModal>;
