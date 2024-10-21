import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState = {
    showModal: false,
    username: '',
    loading: false,
};

export const deleteUserModalSlice = createSlice({
    name: 'deleteUserModal',
    initialState,
    reducers: {
        setModalState(
            state,
            {payload}: PayloadAction<{showModal?: boolean; username?: string; loading?: boolean}>,
        ) {
            if (payload.showModal !== undefined) {
                state.showModal = payload.showModal;
            }

            if (payload.username !== undefined) {
                state.username = payload.username;
            }

            if (payload.loading !== undefined) {
                state.loading = payload.loading;
            }
        },
    },
});
