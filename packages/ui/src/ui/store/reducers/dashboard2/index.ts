import {createSlice} from '@reduxjs/toolkit';

const dashboard2Slice = createSlice({
    name: 'dashboard2',
    initialState: {
        isEditing: false,
    },
    reducers: {
        toggleEditing: (state) => ({
            ...state,
            isEditing: !state.isEditing,
        }),
    },
});

export const {toggleEditing} = dashboard2Slice.actions;
export default dashboard2Slice.reducer;
