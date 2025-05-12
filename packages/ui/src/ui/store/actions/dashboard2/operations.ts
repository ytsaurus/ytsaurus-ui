import {ThunkAction} from '@reduxjs/toolkit';

import filter_ from 'lodash/filter';
import isEqual_ from 'lodash/isEqual';

import {RootState} from '../../../store/reducers';
import {setSettingByKey} from '../../../store/actions/settings';
import {getCluster} from '../../../store/selectors/global';
import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';

import {dashboardConfig} from '../../../constants/dashboard2';

export function setOperationsAuthorTypeFilter(
    id: string,
    authorType: 'me' | 'my-list',
): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const config = getDashboardConfig(state);

        const oldItem = config.items.find((item) => item.id === id);

        if (!oldItem) return;

        const newItem = {...oldItem, data: {...oldItem?.data, authorType}};
        const newItems = [...filter_(config.items, (item) => !isEqual_(item, oldItem)), newItem];
        const newConfig = {...config, items: newItems};

        dispatch(
            setSettingByKey(
                `local::${cluster}::dashboard::config` as const,
                newConfig ?? dashboardConfig,
            ),
        );
    };
}

export function setOperationsStateFilter(
    id: string,
    operationsState: string,
): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const config = getDashboardConfig(state);

        const oldItem = config.items.find((item) => item.id === id);

        if (!oldItem) return;

        const newItem = {...oldItem, data: {...oldItem?.data, state: operationsState}};
        const newItems = [...filter_(config.items, (item) => !isEqual_(item, oldItem)), newItem];
        const newConfig = {...config, items: newItems};

        dispatch(
            setSettingByKey(
                `local::${cluster}::dashboard::config` as const,
                newConfig ?? dashboardConfig,
            ),
        );
    };
}
