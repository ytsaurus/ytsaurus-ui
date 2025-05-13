import {ServicePair} from '../../../../../../components/Dialog/controls/ServicesSelect/ServicesSelect';

export type ServicesSettingsValues = {
    name: string;
    services: ServicePair[];
    autoheight: boolean;
};

export function useServicesSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Services',
            },
        },
        {
            type: 'services-select' as const,
            name: 'services',
            caption: 'Services',
        },
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
