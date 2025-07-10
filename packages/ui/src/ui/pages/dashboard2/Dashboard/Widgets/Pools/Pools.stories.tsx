import * as React from 'react';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';
import {http} from 'msw';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../constants/dashboard2';

import {poolsResponse} from './pools-response';
// import {setSettingByKey} from '../../../../../store/actions/settings';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const poolsWidgetConfigDefault: DashKitProps['config'] = {
    salt: '1',
    counter: 1,
    items: [
        {
            id: 'pools',
            data: defaultDashboardItems.pools.data,
            type: 'pools',
            namespace: 'dashboard',
            orderId: 0,
        },
    ],
    layout: [
        {
            ...defaultDashboardItems['pools'].layout,
            x: 0,
        },
    ],
    aliases: {},
    connections: [],
};

const meta = {
    title: 'Dashboard/Pools Widget',
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
                config={poolsWidgetConfigDefault}
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
                    return Response.json(poolsResponse);
                }),
                // http.post('https://test-cluster.yt.my-domain.com/api/v3/list_pools', () => {
                //     return Response.json(response);
                // }),
            ],
        },
    },
};

export const Loading = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={poolsWidgetConfigDefault}
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
                        return Response.json([{output: {pools: []}}]);
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
                config={poolsWidgetConfigDefault}
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
                    // ADD TEST FOR [output: {}]
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
                config={poolsWidgetConfigDefault}
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
                    return new Response('Internal Server Error', {status: 500});
                }),
            ],
        },
    },
};
