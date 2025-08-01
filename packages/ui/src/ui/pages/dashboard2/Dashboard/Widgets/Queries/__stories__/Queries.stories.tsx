import * as React from 'react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {WidgetBase} from '../../../components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../utils/mocks';

import {QueriesWidgetControls} from '../QueriesWidgetControls/QueriesWidgetControls';
import {QueriesWidgetContent} from '../QueriesWidgetContent/QueriesWidgetContent';
import {QueriesWidgetHeader} from '../QueriesWidgetHeader/QueriesWidgetHeader';
import {QueriesWidgetProps} from '../types';
import {
    queriesHandler,
    queriesHandlerEmpty,
    queriesHandlerError,
    queriesHandlerWithLoading,
} from '../__tests__/mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const meta = {
    title: 'Dashboard/Queries Widget',
    decorators: [
        (Story: any) => (
            <div style={{padding: '20px', height: '1000px'}}>
                <Story />
            </div>
        ),
    ],
};

const BaseComponent = () => (
    <div style={{height: 235, width: 650}}>
        <WidgetBase
            {...baseWidgetProps}
            controls={<QueriesWidgetControls {...(baseWidgetProps as QueriesWidgetProps)} />}
            content={<QueriesWidgetContent {...(baseWidgetProps as QueriesWidgetProps)} />}
            header={<QueriesWidgetHeader {...(baseWidgetProps as QueriesWidgetProps)} />}
        />
    </div>
);

export default meta;

export const Default = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [queriesHandler],
        },
    },
};

export const Loading = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [queriesHandlerWithLoading],
        },
    },
};

export const Empty = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [queriesHandlerEmpty],
        },
    },
};

export const Error = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [queriesHandlerError],
        },
    },
};
