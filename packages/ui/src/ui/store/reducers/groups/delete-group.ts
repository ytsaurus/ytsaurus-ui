import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState = {
    groupNameToDelete: '',
};

export const deleteGroupModalSlice = createSlice({
    name: 'deleteGroupModal',
    initialState,
    reducers: {
        setModalState(state, {payload}: PayloadAction<typeof initialState>) {
            state.groupNameToDelete = payload.groupNameToDelete;
        },
    },
});
