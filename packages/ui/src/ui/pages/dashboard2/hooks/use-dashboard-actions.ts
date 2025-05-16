import {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {DashKitProps} from '@gravity-ui/dashkit';

import {setSettingByKey} from '../../../store/actions/settings';
import {openSettingsDialog, toggleEditing} from '../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';
import {getCluster} from '../../../store/selectors/global';

import {defaultDashboardItems} from '../../../constants/dashboard2';

type ConfigsTypes = keyof typeof defaultDashboardItems;

export function useDashboardActions() {
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const config = useSelector(getDashboardConfig);

    const settingPath = `local::${cluster}::dashboard::config` as const;
    const prevConfig = useRef(config);

    const save = () => {
        dispatch(setSettingByKey(settingPath, config));
        dispatch(toggleEditing());
    };
    const update = (newConfig: DashKitProps['config']) => {
        dispatch(setSettingByKey(settingPath, {...newConfig}));
    };
    const add = (itemType: ConfigsTypes) => {
        dispatch(
            openSettingsDialog({
                edittingConfig: {
                    target: 'createItem',
                    type: itemType,
                    data: defaultDashboardItems[itemType].data,
                },
            }),
        );
    };
    const cancel = () => {
        dispatch(setSettingByKey(settingPath, prevConfig.current));
        dispatch(toggleEditing());
    };
    const edit = () => {
        dispatch(toggleEditing());
    };
    const reset = () => {
        // unset items to make selector know to prepare default config
        dispatch(setSettingByKey(settingPath, {...config, items: []}));
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
