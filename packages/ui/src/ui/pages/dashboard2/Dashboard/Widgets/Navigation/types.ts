import {PluginWidgetProps} from '@gravity-ui/dashkit';

export type NavigationWidgetData = {
    name?: string;
};

export type NavigationWidgetProps = PluginWidgetProps & {
    data?: NavigationWidgetData;
};
