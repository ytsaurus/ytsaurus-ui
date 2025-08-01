import * as React from 'react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {WidgetBase} from '../../../components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../utils/mocks';

import {ServicesWidgetControls} from '../ServicesWidgetControls/ServicesWidgetControls';
import {ServicesWidgetContent} from '../ServicesWidgetContent/ServicesWidgetContent';
import {ServicesWidgetHeader} from '../ServicesWidgetHeader/ServicesWidgetHeader';
import type {ServicesWidgetProps} from '../types';
import {
    servicesHandler,
    servicesHandlerEmpty,
    servicesHandlerError,
    servicesHandlerWithLoading,
} from '../__tests__/mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const meta = {
    title: 'Dashboard/Services Widget',
    decorators: [
        (Story: any) => (
            <div style={{padding: '20px', height: '1000px'}}>
                <Story />
            </div>
        ),
    ],
};

const BaseComponent = () => (
    <div style={{height: 240, width: 550}}>
        <WidgetBase
            {...baseWidgetProps}
            controls={<ServicesWidgetControls {...(baseWidgetProps as ServicesWidgetProps)} />}
            content={<ServicesWidgetContent {...(baseWidgetProps as ServicesWidgetProps)} />}
            header={<ServicesWidgetHeader {...(baseWidgetProps as ServicesWidgetProps)} />}
        />
    </div>
);

export default meta;

export const Default = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: servicesHandler,
        },
    },
};

export const Loading = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: servicesHandlerWithLoading,
        },
    },
};

export const Empty = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: servicesHandlerEmpty,
        },
    },
};

export const Error = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: servicesHandlerError,
        },
    },
};
