import * as React from 'react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {WidgetBase} from '../../../components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../utils/mocks';

import {NavigationWidgetControls} from '../NavigationWidgetControls/NavigationWidgetControls';
import {NavigationWidgetContent} from '../NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetHeader} from '../NavigationWidgetHeader/NavigationWidgetHeader';
import {
    pathsHandler,
    pathsHandlerEmpty,
    pathsHandlerError,
    pathsHandlerWithLoading,
} from '../__tests__/mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const meta = {
    title: 'Dashboard/Navigation Widget',
    decorators: [
        (Story: any) => (
            <div style={{padding: '20px', height: '1000px'}}>
                <Story />
            </div>
        ),
    ],
};

const BaseComponent = () => (
    <div style={{height: 535, width: 350}}>
        <WidgetBase
            controls={<NavigationWidgetControls {...baseWidgetProps} />}
            content={<NavigationWidgetContent {...baseWidgetProps} />}
            header={<NavigationWidgetHeader {...baseWidgetProps} />}
            {...baseWidgetProps}
        />
    </div>
);

export default meta;

export const Default = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [pathsHandler],
        },
    },
};

export const Loading = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [pathsHandlerWithLoading],
        },
    },
};

export const Empty = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [pathsHandlerEmpty],
        },
    },
};

export const Error = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [pathsHandlerError],
        },
    },
};
