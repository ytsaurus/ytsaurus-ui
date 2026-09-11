import React, {type PropsWithChildren, useEffect} from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {SUPPORTED_FEATURES_SUCCESS} from '../../../../constants/global';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global';
import {EditOperationDialog} from '../EditOperationDialog';
import {
    TEST_CLUSTER,
    TEST_OPERATION_ID,
    getLongPoolTreeOperationHandler,
    getOperationHandler,
    getTerminalOperationHandler,
} from './mocks';

yt.setup.setGlobalOption('proxy', TEST_CLUSTER);

function SpecificationPatchSupport({enabled, children}: PropsWithChildren<{enabled: boolean}>) {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);

    useEffect(() => {
        dispatch({
            type: SUPPORTED_FEATURES_SUCCESS,
            data: {
                featuresCluster: cluster,
                features: enabled ? {cumulative_spec_patch: true} : {},
            },
        });
    }, [cluster, dispatch, enabled]);

    return children;
}

const meta: Meta<typeof EditOperationDialog> = {
    title: 'Pages/Operations/EditOperationDialog',
    component: EditOperationDialog,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        operationId: TEST_OPERATION_ID,
        visible: true,
        onClose: () => {},
    },
};

export default meta;
type Story = StoryObj<typeof EditOperationDialog>;

export const Default: Story = {
    render: (args) => (
        <SpecificationPatchSupport enabled>
            <EditOperationDialog {...args} />
        </SpecificationPatchSupport>
    ),
    parameters: {
        msw: {handlers: [getOperationHandler]},
    },
};

export const LongPoolTreeNames: Story = {
    render: (args) => (
        <SpecificationPatchSupport enabled>
            <EditOperationDialog {...args} />
        </SpecificationPatchSupport>
    ),
    parameters: {
        msw: {handlers: [getLongPoolTreeOperationHandler]},
    },
};

export const UnsupportedSpecificationPatch: Story = {
    render: (args) => (
        <SpecificationPatchSupport enabled={false}>
            <EditOperationDialog {...args} />
        </SpecificationPatchSupport>
    ),
    parameters: {
        msw: {handlers: [getOperationHandler]},
    },
};

export const TerminalOperation: Story = {
    render: (args) => (
        <SpecificationPatchSupport enabled>
            <EditOperationDialog {...args} />
        </SpecificationPatchSupport>
    ),
    parameters: {
        msw: {handlers: [getTerminalOperationHandler]},
    },
};
