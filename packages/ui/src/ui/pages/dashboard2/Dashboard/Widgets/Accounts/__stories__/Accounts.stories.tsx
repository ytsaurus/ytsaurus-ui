import * as React from 'react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {defaultDashboardItems} from '../../../../../../constants/dashboard2';

import {WidgetBase} from '../../../components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../utils/mocks';

import {AccountsWidgetControls} from '../AccountsWidgetControls/AccountsWidgetControls';
import {AccountsWidgetContent} from '../AccountsWidgetContent/AccountsWidgetContent';
import {AccountsWidgetHeader} from '../AccountsWidgetHeader/AccountsWidgetHeader';
import {AccountsWidgetProps} from '../types';

import {
    accountsHandler,
    accountsHandlerEmpty,
    accountsHandlerError,
    accountsHandlerWithLoading,
} from '../__tests__/mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

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

const extenedAccountsProps = {
    ...baseWidgetProps,
    data: {
        ...defaultDashboardItems.accounts.data,
        columns: [
            {name: 'Nodes'},
            {name: 'Chunks'},
            {name: 'super_mega_wide_medium_that_cannot_fit_in'},
        ],
        name: baseWidgetProps.data.name,
    },
};

const BaseComponent = () => (
    <div style={{height: 255, width: 750}}>
        <WidgetBase
            {...extenedAccountsProps}
            controls={<AccountsWidgetControls {...(extenedAccountsProps as AccountsWidgetProps)} />}
            content={<AccountsWidgetContent {...(extenedAccountsProps as AccountsWidgetProps)} />}
            header={<AccountsWidgetHeader {...(extenedAccountsProps as AccountsWidgetProps)} />}
        />
    </div>
);

export default meta;

export const Default = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [accountsHandler],
        },
    },
};

export const Loading = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [accountsHandlerWithLoading],
        },
    },
};

export const Empty = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [accountsHandlerEmpty],
        },
    },
};

export const Error = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [accountsHandlerError],
        },
    },
};
