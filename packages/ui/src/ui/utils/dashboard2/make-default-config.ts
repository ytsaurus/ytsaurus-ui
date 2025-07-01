import {dashboardConfig} from '../../constants/dashboard2/index';

export function makeDefaultConfig() {
    //const prevItems = [...dashboardConfig.items.slice(0, 4)];

    // // we always have queries item in default config(its a constant)
    // const queriesItem = find_(prevItems, (item) => item.type === 'queries')!;
    // // new item cause of default username
    // const newItem = {
    //     ...queriesItem,
    //     data: {
    //         ...queriesItem?.data,
    //         authors: [{value: username, type: 'users'}],
    //     },
    // };

    // remove_(prevItems, (item) => item.type === 'queries');

    // const config: DashKitProps['config'] = {
    //     ...dashboardConfig,
    //     items: [...prevItems, newItem],
    // };

    return dashboardConfig;
}
