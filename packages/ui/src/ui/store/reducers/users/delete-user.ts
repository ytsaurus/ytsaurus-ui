import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState = {
    usernameToDelete: '',
};

export const deleteUserModalSlice = createSlice({
    name: 'deleteUserModal',
    initialState,
    reducers: {
        setModalState(state, {payload}: PayloadAction<typeof initialState>) {
            state.usernameToDelete = payload.usernameToDelete;
        },
    },
});
