import * as React from 'react';
import {DashKit, DashKitProps} from '@gravity-ui/dashkit';
import {HttpResponse, http} from 'msw';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../constants/dashboard2';

import {accountsResponse} from './accounts-response';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const accountsWidgetConfig: DashKitProps['config'] = {
    salt: '1',
    counter: 1,
    items: [
        {
            id: 'accounts',
            data: {
                ...defaultDashboardItems.accounts.data,
                columns: [
                    {name: 'Nodes'},
                    {name: 'Chunks'},
                    {name: 'super_mega_wide_medium_that_cannot_fit_in'},
                ],
            },
            type: 'accounts',
            namespace: 'dashboard',
            orderId: 0,
        },
    ],
    layout: [
        {
            ...defaultDashboardItems['accounts'].layout,
            w: 18,
            x: 0,
        },
    ],
    aliases: {},
    connections: [],
};

const meta = {
    title: 'Dashboard/Accounts Widget',
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
                config={accountsWidgetConfig}
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
                    return Response.json(accountsResponse);
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
                config={accountsWidgetConfig}
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
                    async ({request}) => {
                        const body = await await request.clone().json();
                        if (
                            body.requests[0].parameters.path !==
                            '//sys/users/test-user/@usable_accounts'
                        ) {
                        }
                        await new Promise((resolve) => setTimeout(resolve, 10000));
                        return Response.json(accountsResponse);
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
                config={accountsWidgetConfig}
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
            ],
        },
    },
};

export const Error = {
    render: () => {
        return (
            <DashKit
                editMode={false}
                config={accountsWidgetConfig}
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
            ],
        },
    },
};
