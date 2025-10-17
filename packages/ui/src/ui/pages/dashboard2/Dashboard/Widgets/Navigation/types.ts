import {PluginWidgetProps} from '@gravity-ui/dashkit';

export type NavigationWidgetData = {
    name?: string;
    show_navigation_input?: boolean;
};

export type NavigationWidgetProps = PluginWidgetProps & {
    data?: NavigationWidgetData;
};
