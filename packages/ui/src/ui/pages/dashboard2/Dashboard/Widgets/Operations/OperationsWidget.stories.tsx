import * as React from 'react';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';
import {http} from 'msw';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../constants/dashboard2';

import {batchResponse, batchResponseLong} from './operations-response';
// import {setSettingByKey} from '../../../../../store/actions/settings';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const operationsWidgetConfigDefault: DashKitProps['config'] = {
    salt: '1',
    counter: 1,
    items: [
        {
            id: 'operations',
            data: defaultDashboardItems.operations.data,
            type: 'operations',
            namespace: 'dashboard',
            orderId: 0,
        },
    ],
    layout: [
        {
            ...defaultDashboardItems['operations'].layout,
            h: 18,
        },
    ],
    aliases: {},
    connections: [],
};

const operationsWidgetConfigLong: DashKitProps['config'] = {
    salt: '1',
    counter: 1,
    items: [
        {
            id: 'operations',
            data: defaultDashboardItems.operations.data,
            type: 'operations',
            namespace: 'dashboard',
            orderId: 0,
        },
    ],
    layout: [
        {
            ...defaultDashboardItems['operations'].layout,
            w: 15,
            h: 9,
        },
    ],
    aliases: {},
    connections: [],
};

const meta = {
    title: 'Dashboard/Operations Widget',
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
                config={operationsWidgetConfigDefault}
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
                    return Response.json(batchResponse);
                }),
                // http.post('https://test-cluster.yt.my-domain.com/api/v3/list_operations', () => {
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
                config={operationsWidgetConfigDefault}
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
                        return Response.json([{output: {operations: []}}]);
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
                config={operationsWidgetConfigDefault}
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
                    return Response.json([{output: {operations: []}}]);
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
                config={operationsWidgetConfigDefault}
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

export const LongNamesShortWidget = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={operationsWidgetConfigLong}
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
                    return Response.json(batchResponseLong);
                }),
                // http.post('https://test-cluster.yt.my-domain.com/api/v3/list_operations', () => {
                //     return Response.json(response);
                // }),
            ],
        },
    },
};
