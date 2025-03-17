import {useDispatch, useSelector} from 'react-redux';
import {DashKit} from '@gravity-ui/dashkit';

import {setConfig} from '../../../store/reducers/dashboard2/dashboard';
import {getConfig} from '../../../store/selectors/dashboard2/dashboard';

import {Layouts} from '../../../constants/dashboard2';

type ConfigsTypes = keyof typeof Layouts;

export function useUpdateDashboard() {
    const dispatch = useDispatch();
    const config = useSelector(getConfig);

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

    const newConfig = (configType: ConfigsTypes) =>
        DashKit.setItem({
            item: {
                namespace: 'default',
                type: configType,
                data: {},
                layout: computeNewItemLayout(configType),
            },
            config: config,
        });

    const update = (configType: ConfigsTypes) => dispatch(setConfig(newConfig(configType)));

    return {update};
}
