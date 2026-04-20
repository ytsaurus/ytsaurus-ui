import {type PluginWidgetProps} from '@gravity-ui/dashkit';

import {type ServicePair} from '../../../../../components/Dialog/controls/ServicesSelect/ServicesSelect';

export type ServicesWidgetData = {
    name: string;
    services: ServicePair[];
};

export type ServicesWidgetProps = PluginWidgetProps & {
    data?: ServicesWidgetData;
};
