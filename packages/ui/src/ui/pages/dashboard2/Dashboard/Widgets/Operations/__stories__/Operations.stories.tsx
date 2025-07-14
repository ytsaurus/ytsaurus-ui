import * as React from 'react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {WidgetBase} from '../../../components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../utils/mocks';

import {OperationsWidgetControls} from '../OperationsWidgetControls/OperationsWidgetControls';
import {OperationsWidgetContent} from '../OperationsWidgetContent/OperationsWidgetContent';
import {OperationsWidgetHeader} from '../OperationsWidgetHeader/OperationsWidgetHeader';
import {
    operationsHandler,
    operationsHandlerEmpty,
    operationsHandlerError,
    operationsHandlerLongNames,
    operationsHandlerWithLoading,
} from '../__tests__/mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

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

const BaseComponent = () => (
    <div style={{height: 455, width: '100%'}}>
        <WidgetBase
            controls={<OperationsWidgetControls {...baseWidgetProps} />}
            content={<OperationsWidgetContent {...baseWidgetProps} />}
            header={<OperationsWidgetHeader {...baseWidgetProps} />}
            {...baseWidgetProps}
        />
    </div>
);

export default meta;

export const Default = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationsHandler],
        },
    },
};

export const Loading = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationsHandlerWithLoading],
        },
    },
};

export const Empty = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationsHandlerEmpty],
        },
    },
};

export const Error = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationsHandlerError],
        },
    },
};

const SmallComponent = () => (
    <div style={{height: 230, width: 680}}>
        <WidgetBase
            controls={<OperationsWidgetControls {...baseWidgetProps} />}
            content={<OperationsWidgetContent {...baseWidgetProps} />}
            header={<OperationsWidgetHeader {...baseWidgetProps} />}
            {...baseWidgetProps}
        />
    </div>
);

export const LongNamesShortWidget = {
    render: SmallComponent,
    parameters: {
        msw: {
            handlers: [operationsHandlerLongNames],
        },
    },
};
