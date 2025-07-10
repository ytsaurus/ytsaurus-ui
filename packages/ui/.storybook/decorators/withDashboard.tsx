import {Decorator} from '@storybook/react';
import {registerPlugins} from '../../../ui/src/ui/pages/dashboard2/Dashboard/utils/registerPlugins';

registerPlugins()

export const WithDashboard: Decorator = (Story) => {
    return (
        <Story />
    );
};
