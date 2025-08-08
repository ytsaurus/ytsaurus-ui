import * as React from 'react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../../constants/dashboard2';

import {WidgetBase} from '../../../components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../utils/mocks';

import {PoolsWidgetControls} from '../PoolsWidgetControls/PoolsWidgetControls';
import {PoolsWidgetContent} from '../PoolsWidgetContent/PoolsWidgetContent';
import {PoolsWidgetHeader} from '../PoolsWidgetHeader/PoolsWidgetHeader';
import type {PoolsWidgetProps} from '../types';
import {
    poolsHandler,
    poolsHandlerEmpty,
    poolsHandlerError,
    poolsHandlerWithLoading,
} from '../__tests__/mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

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

const extendPoolsProps = {
    ...baseWidgetProps,
    data: {
        ...defaultDashboardItems.pools.data,
        name: baseWidgetProps.data.name,
    },
} as PoolsWidgetProps;

const BaseComponent = () => (
    <div style={{height: 260, width: 560}}>
        <WidgetBase
            {...extendPoolsProps}
            controls={<PoolsWidgetControls {...extendPoolsProps} />}
            content={<PoolsWidgetContent {...extendPoolsProps} />}
            header={<PoolsWidgetHeader {...extendPoolsProps} />}
        />
    </div>
);

export default meta;

export const Default = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [poolsHandler],
        },
    },
};

export const Loading = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [poolsHandlerWithLoading],
        },
    },
};

export const Empty = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [poolsHandlerEmpty],
        },
    },
};

export const Error = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [poolsHandlerError],
        },
    },
};
