import * as React from 'react';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';
import {HttpResponse, http} from 'msw';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../constants/dashboard2';

import {queriesResponse} from './queries-response';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const queriesWidgetConfig: DashKitProps['config'] = {
    salt: '1',
    counter: 1,
    items: [
        {
            id: 'queries',
            data: defaultDashboardItems.queries.data,
            type: 'queries',
            namespace: 'dashboard',
            orderId: 0,
        },
    ],
    layout: [
        {
            ...defaultDashboardItems['queries'].layout,
        },
    ],
    aliases: {},
    connections: [],
};

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

export default meta;

export const Default = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={queriesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://test-cluster.yt.my-domain.com/api/v4/execute_batch', () => {
                    return Response.json(queriesResponse);
                }),
            ],
        },
    },
};

export const Loading = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={queriesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post(
                    'https://test-cluster.yt.my-domain.com/api/v4/execute_batch',
                    async () => {
                        await new Promise((resolve) => setTimeout(resolve, 10000));
                        return Response.json(queriesResponse);
                    },
                ),
            ],
        },
    },
};

export const Empty = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={queriesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://test-cluster.yt.my-domain.com/api/v4/execute_batch', () => {
                    return Response.json([]);
                }),
            ],
        },
    },
};

export const Error = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={queriesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://test-cluster.yt.my-domain.com/api/v4/execute_batch', () => {
                    return HttpResponse.error();
                }),
            ],
        },
    },
};
