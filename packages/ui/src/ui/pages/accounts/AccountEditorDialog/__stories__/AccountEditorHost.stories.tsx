import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import {AccountEditButton} from '../AccountEditButton';
import {useAccountEditor} from '../AccountEditorContext';
import {type AccountEditorDataLoaderProps} from '../AccountEditorDataLoader';
import {AccountEditorHost} from '../AccountEditorHost';
import {type AccountEditorData} from '../prepareAccountEditorData';
import {toaster} from '../../../../utils/toaster';

const accountName = 'account';
const account = {
    name: accountName,
    parent: 'root',
    abc: {},
    hasRecursiveResources: false,
};
const editorData = {
    accounts: [account],
    accountsByName: {[accountName]: account},
    tree: {
        [accountName]: {
            name: accountName,
            parent: '<Root>',
            attributes: account,
            children: [],
            leaves: [],
        },
    },
} as unknown as AccountEditorData;

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
            <AccountEditButton accountName="root">Edit root</AccountEditButton>
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
        <ToasterProvider toaster={toaster}>
            <AccountEditorHost DataLoader={DataLoader}>
                <EditorButtons />
            </AccountEditorHost>
            <ToasterComponent />
        </ToasterProvider>
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
