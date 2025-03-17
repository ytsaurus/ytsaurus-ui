import {DashKitProps} from '@gravity-ui/dashkit';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {Layouts} from '../../../constants/dashboard2';

export const config: DashKitProps['config'] = {
    salt: '0.1231231023012831',
    counter: 5,
    items: [
        {
            id: 'navigation',
            data: {},
            type: 'navigation',
            namespace: 'dashboard',
            orderId: 0,
        },
        {
            id: 'operations',
            data: {},
            type: 'operations',
            namespace: 'dashboard',
            orderId: 1,
        },
        {
            id: 'accounts',
            data: {},
            type: 'accounts',
            namespace: 'dashboard',
            orderId: 2,
        },
        {
            id: 'pools',
            data: {},
            type: 'pools',
            namespace: 'dashboard',
            orderId: 3,
        },
        {
            id: 'queries',
            data: {},
            type: 'queries',
            namespace: 'dashboard',
            orderId: 4,
        },
    ],
    layout: [
        Layouts['navigation'],
        Layouts['operations'],
        Layouts['pools'],
        Layouts['accounts'],
        Layouts['queries'],
    ],
    aliases: {},
    connections: [],
};

const dashboard2Slice = createSlice({
    name: 'dashboard2',
    initialState: {
        isEditing: false,
        config,
    },
    reducers: {
        toggleEditing: (state) => ({
            ...state,
            isEditing: !state.isEditing,
        }),
        setConfig: (state, {payload}: PayloadAction<DashKitProps['config']>) => ({
            ...state,
            config: payload,
        }),
    },
});

export const {toggleEditing, setConfig} = dashboard2Slice.actions;
export const dashboard2 = dashboard2Slice.reducer;
