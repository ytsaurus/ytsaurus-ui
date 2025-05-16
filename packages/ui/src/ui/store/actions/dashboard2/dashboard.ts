import {ThunkAction} from '@reduxjs/toolkit';
import {ConfigItem, DashKit} from '@gravity-ui/dashkit';

import find_ from 'lodash/find';
import remove_ from 'lodash/remove';

import {RootState} from '../../../store/reducers';
import {setSettingByKey} from '../../../store/actions/settings';
import type {ItemsTypes} from '../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from './../../selectors/dashboard2/dashboard';

import {dashboardConfig, defaultDashboardItems} from '../../../constants/dashboard2';

export function editConfig(
    type: 'editItem' | 'createItem',
    data: any,
    edittingItem: Partial<ConfigItem> & {type: ItemsTypes},
): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = state.global.cluster;
        const config = getDashboardConfig(state);
        const configItems = [...(config?.items || [])];

        const generateConfig = (configType: ItemsTypes, data: any) =>
            DashKit.setItem({
                item: {
                    namespace: 'dashboard',
                    type: configType,
                    data: {...defaultDashboardItems[configType].data, ...data},
                },
                config,
            });

        if (type === 'editItem') {
            const prevItem = find_(configItems, (e) => e.id === edittingItem?.id);
            if (prevItem) {
                const newItem = {...prevItem, data: {...data}};
                remove_(configItems, prevItem);
                configItems.push(newItem);
                const newConfig = {...config, items: [...configItems]};
                dispatch(setSettingByKey(`local::${cluster}::dashboard::config`, newConfig));
            }
        }
        if (type === 'createItem') {
            const newConfig = generateConfig(edittingItem?.type, data);
            dispatch(setSettingByKey(`local::${cluster}::dashboard::config`, {...newConfig}));
        }
    };
}

export function importConfig(cluster: string): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const state = getState();
        const currentCluster = state.global.cluster;
        const config = state.settings.data[`local::${cluster}::dashboard::config`];

        dispatch(
            setSettingByKey(
                `local::${currentCluster}::dashboard::config` as const,
                config ?? dashboardConfig,
            ),
        );
    };
}
