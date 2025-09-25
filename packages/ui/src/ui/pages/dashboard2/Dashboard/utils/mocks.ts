import {PluginWidgetProps} from '@gravity-ui/dashkit/build/esm';

export const baseWidgetProps: PluginWidgetProps = {
    params: {},
    width: 2,
    height: 2,
    data: {
        name: 'SUPER MEGA WIDE HEADER THAT CANNOT FIT IN 1111-1111-1111-1111-1111-1111-1111-1111-1111',
    },
    namespace: '',
    layout: [],
    onStateAndParamsChange: () => {},
    onBeforeLoad: () => () => {},
    settings: {autoupdateInterval: Infinity, silentLoading: true},
    context: {},
    adjustWidgetLayout: () => {},
    state: {},
    id: 'some_id',
    editMode: false,
    defaults: undefined,
    gridLayout: undefined,
};
