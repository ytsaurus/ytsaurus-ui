import {useRef} from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';

import debounce_ from 'lodash/debounce';

import {setSettingByKey} from '../../../store/actions/settings';
import {toggleEditing} from '../../../store/reducers/dashboard2/dashboard';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

import {Layouts, dashboardConfig} from '../../../constants/dashboard2';

type ConfigsTypes = keyof typeof Layouts;

export function useUpdateDashboard() {
    const dispatch = useDispatch();

    const config = useSelector(getSettingsData)['global::dashboard::config'];

    const prevConfig = useRef(config);

    const computeNewItemLayout = (configType: ConfigsTypes) => {
        const prevLayout = config.layout;
        const prevItem = prevLayout[prevLayout.length - 1] || {x: 0, y: 0, w: 0, h: 0};
        const hasEnoughSpace = prevItem.x + prevItem.w <= 36 - Layouts[configType].w;

        const h = Math.max(Layouts[configType].h, prevItem.h);
        const x = hasEnoughSpace ? prevItem.x : 0;
        const y = hasEnoughSpace ? prevItem.y : prevItem.y + 1;
        const w = Layouts[configType].w;
        return {x, y, h, w, i: crypto.randomUUID()};
    };

    const generateConfig = (configType: ConfigsTypes) =>
        DashKit.setItem({
            item: {
                namespace: 'dashboard',
                type: configType,
                data: {},
                layout: computeNewItemLayout(configType),
            },
            config,
        });

    const save = () => {
        dispatch(setSettingByKey('global::dashboard::config', config));
        dispatch(toggleEditing());
    };
    const update = (newConfig: DashKitProps['config']) => {
        dispatch(setSettingByKey('global::dashboard::config', newConfig));
    };
    const add = (configType: ConfigsTypes) =>
        dispatch(setSettingByKey('global::dashboard::config', generateConfig(configType)));
    const cancel = () => {
        dispatch(setSettingByKey('global::dashboard::config', prevConfig.current));
        dispatch(toggleEditing());
    };
    const edit = () => {
        dispatch(toggleEditing());
    };
    const reset = () => {
        dispatch(dispatch(setSettingByKey('global::dashboard::config', dashboardConfig)));
    };

    return {
        edit,
        add,
        save,
        cancel,
        update,
        reset,
    };
}
