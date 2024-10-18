import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState = {
    showModal: false,
    username: '',
};

export const deleteUserModalSlice = createSlice({
    name: 'deleteUserModal',
    initialState,
    reducers: {
        setModalState(state, {payload}: PayloadAction<Partial<typeof initialState>>) {
            if (state.showModal = payload.showModal !== undefined) {
                state.showModal = payload.showModal;
            }

            if (payload.username !== undefined) {
                state.username = payload.username;
            }
        },
    },
    selectors: {
        selectModalState: (state) => state,
    },
});
