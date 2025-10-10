import {useDispatch} from '../../../store/redux-hooks';
import {DashKitProps} from '@gravity-ui/dashkit';

import {
    cancelEditting,
    saveEdittingConfig,
    startEditting,
    updateEdittingConfig,
} from '../../../store/actions/dashboard2/dashboard';
import {openSettingsDialog} from '../../../store/reducers/dashboard2/dashboard';

import {defaultDashboardItems} from '../../../constants/dashboard2';

type ConfigsTypes = keyof typeof defaultDashboardItems;

export function useDashboardActions() {
    const dispatch = useDispatch();

    const save = () => {
        dispatch(saveEdittingConfig());
    };
    const update = (newConfig: DashKitProps['config']) => {
        dispatch(updateEdittingConfig(newConfig));
    };
    const add = (itemType: ConfigsTypes) => {
        dispatch(
            openSettingsDialog({
                edittingItem: {
                    target: 'createItem',
                    type: itemType,
                    data: defaultDashboardItems[itemType].data,
                },
            }),
        );
    };
    const cancel = () => {
        dispatch(cancelEditting());
    };
    const edit = () => {
        dispatch(startEditting());
    };

    return {
        edit,
        add,
        save,
        cancel,
        update,
    };
}
