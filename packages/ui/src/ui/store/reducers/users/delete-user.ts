import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState = {
    showModal: false,
    username: '',
};

export const deleteUserModalSlice = createSlice({
    name: 'deleteUserModal',
    initialState,
    reducers: {
        setModalState(state, {payload}: PayloadAction<{showModal: boolean; username?: string}>) {
            state.showModal = payload.showModal;

            if (payload.username) {
                state.username = payload.username;
            }
        },
    },
    selectors: {
        selectModalState: (state) => state,
    },
});
