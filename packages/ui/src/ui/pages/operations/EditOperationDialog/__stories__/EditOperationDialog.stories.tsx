import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {EditOperationDialog} from '../EditOperationDialog';
import {TEST_CLUSTER, longPoolTreeOperation, operation, terminalOperation} from './mocks';

yt.setup.setGlobalOption('proxy', TEST_CLUSTER);

const meta: Meta<typeof EditOperationDialog> = {
    title: 'Pages/Operations/EditOperationDialog',
    component: EditOperationDialog,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        operationAttributes: operation,
        specificationPatchSupported: true,
        visible: true,
        onClose: () => {},
    },
};

export default meta;
type Story = StoryObj<typeof EditOperationDialog>;

export const Default: Story = {
    render: (args) => <EditOperationDialog {...args} />,
};

export const LongPoolTreeNames: Story = {
    render: (args) => <EditOperationDialog {...args} />,
    args: {
        operationAttributes: longPoolTreeOperation,
    },
};

export const UnsupportedSpecificationPatch: Story = {
    render: (args) => <EditOperationDialog {...args} />,
    args: {
        specificationPatchSupported: false,
    },
};

export const TerminalOperation: Story = {
    render: (args) => <EditOperationDialog {...args} />,
    args: {
        operationAttributes: terminalOperation,
    },
};
