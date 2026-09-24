import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {AccountEditButton} from '../AccountEditButton';
import {useAccountEditor} from '../AccountEditorContext';
import {type AccountEditorDataLoaderProps} from '../AccountEditorDataLoader';
import {AccountEditorHost} from '../AccountEditorHost';
import {prepareAccountEditorData} from '../prepareAccountEditorData';

const accountName = 'account';
const editorData = prepareAccountEditorData(accountName, {
    $attributes: {parent_name: 'root'},
    $value: {},
});

function OpenOnMount() {
    const {openAccount} = useAccountEditor();

    React.useEffect(() => {
        openAccount(accountName).catch(() => undefined);
    }, [openAccount]);

    return null;
}

function EditorButtons() {
    return (
        <div style={{display: 'flex', gap: 8}}>
            <AccountEditButton accountName={accountName}>Edit account</AccountEditButton>
            <AccountEditButton accountName="another-account">Edit another</AccountEditButton>
            <OpenOnMount />
        </div>
    );
}

function LoadingDataLoader(_props: AccountEditorDataLoaderProps) {
    return null;
}

function LoadedDataLoader({accountName: name, onLoaded}: AccountEditorDataLoaderProps) {
    React.useEffect(() => {
        onLoaded(name, editorData);
    }, [name, onLoaded]);

    return null;
}

function ErrorDataLoader({accountName: name, onError}: AccountEditorDataLoaderProps) {
    React.useEffect(() => {
        onError(name, new Error('Failed to load account'));
    }, [name, onError]);

    return null;
}

function StoryHost({DataLoader}: {DataLoader: React.ComponentType<AccountEditorDataLoaderProps>}) {
    return (
        <AccountEditorHost DataLoader={DataLoader}>
            <EditorButtons />
        </AccountEditorHost>
    );
}

const meta: Meta<typeof StoryHost> = {
    title: 'Pages/Accounts/AccountEditorHost',
    component: StoryHost,
};

export default meta;
type Story = StoryObj<typeof StoryHost>;

export const Opening: Story = {args: {DataLoader: LoadingDataLoader}};
export const Opened: Story = {args: {DataLoader: LoadedDataLoader}};
export const LoadError: Story = {args: {DataLoader: ErrorDataLoader}};
