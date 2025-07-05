import * as React from 'react';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';
import {HttpResponse, http} from 'msw';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../constants/dashboard2';

import {bundlesResponse, chytResponse} from './services-responses';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const servicesWidgetConfig: DashKitProps['config'] = {
    salt: '1',
    counter: 1,
    items: [
        {
            id: 'services',
            data: defaultDashboardItems.services.data,
            type: 'services',
            namespace: 'dashboard',
            orderId: 0,
        },
    ],
    layout: [
        {
            ...defaultDashboardItems['services'].layout,
            w: 15,
        },
    ],
    aliases: {},
    connections: [],
};

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

export default meta;

export const Default = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={servicesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
                    return Response.json(bundlesResponse);
                }),
                http.post('/api/strawberry/chyt/test-cluster/list', () => {
                    return Response.json(chytResponse);
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
                config={servicesWidgetConfig}
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
                    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
                    async () => {
                        await new Promise((resolve) => setTimeout(resolve, 10000));
                        return Response.json(bundlesResponse);
                    },
                ),
                http.post('/api/strawberry/chyt/test-cluster/list', async () => {
                    await new Promise((resolve) => setTimeout(resolve, 10000));
                    return Response.json(chytResponse);
                }),
            ],
        },
    },
};

export const Empty = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={servicesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
                    return Response.json([]);
                }),
                http.post('/api/strawberry/chyt/test-cluster/list', () => {
                    return Response.json({result: []});
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
                config={servicesWidgetConfig}
                onChange={() => {}}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        );
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
                    return HttpResponse.error();
                }),
                http.post('/api/strawberry/chyt/test-cluster/list', () => {
                    return HttpResponse.error();
                }),
            ],
        },
    },
};
