import {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {DashKitProps} from '@gravity-ui/dashkit';

import {setSettingByKey} from '../../../store/actions/settings';
import {openSettingsDialog, toggleEditing} from '../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';
import {getCluster} from '../../../store/selectors/global';

import {defaultDashboardItems} from '../../../constants/dashboard2';

import {makeDashboardConfigSettingName} from '../../../utils/dashboard/makeDashboardConfigSettingName';

type ConfigsTypes = keyof typeof defaultDashboardItems;

export function useUpdateDashboard() {
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const config = useSelector(getDashboardConfig);

    const settingName = makeDashboardConfigSettingName(cluster);
    const prevConfig = useRef(config);

    const save = () => {
        dispatch(setSettingByKey(settingName, config));
        dispatch(toggleEditing());
    };
    const update = (newConfig: DashKitProps['config']) => {
        dispatch(setSettingByKey(settingName, {...newConfig}));
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
        dispatch(setSettingByKey(settingName, prevConfig.current));
        dispatch(toggleEditing());
    };
    const edit = () => {
        dispatch(toggleEditing());
    };

    return {
        edit,
        add,
        save,
        cancel,
        update,
    };
}
