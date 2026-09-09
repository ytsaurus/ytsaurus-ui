import React, {useEffect} from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {GLOBAL_PARTIAL} from '../../../../../constants/global';
import {
    TABLETS_BUNDLES_EDITOR_PARTIAL,
    TABLETS_BUNDLES_PARTIAL,
} from '../../../../../constants/tablets';
import {useDispatch} from '../../../../../store/redux-hooks';
import {BundleEditorDialog} from '../BundleEditorDialog';

import {
    bundleControllerData,
    bundleData,
    bundleDefaultConfig,
    bundleEditorData,
    bundleName,
} from './fixtures';

const meta: Meta<typeof BundleEditorDialog> = {
    title: 'Pages/Tablet cell bundles/BundleEditorDialog',
    component: BundleEditorDialog,
    parameters: {layout: 'fullscreen'},
};

export default meta;
type Story = StoryObj<typeof BundleEditorDialog>;

function SeededBundleEditorDialog() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper: true}});
        dispatch({
            type: TABLETS_BUNDLES_PARTIAL,
            data: {
                bundleDefaultConfig,
                writableByName: new Map([[bundleName, true]]),
            },
        });
        dispatch({
            type: TABLETS_BUNDLES_EDITOR_PARTIAL,
            data: {
                visibleEditor: true,
                bundleName,
                bundleData,
                data: bundleEditorData,
                bundleControllerData,
            },
        });
    }, [dispatch]);

    return <BundleEditorDialog />;
}

export const Default: Story = {render: () => <SeededBundleEditorDialog />};
