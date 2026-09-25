import React from 'react';
import {type Decorator, type Meta, type StoryObj} from '@storybook/react';
import {ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import {configureUIFactory} from '../../../../UIFactory';
import {defaultUIFactory} from '../../../../UIFactory/default-ui-factory';
import {GLOBAL_PARTIAL} from '../../../../constants/global';
import {useDispatch} from '../../../../store/redux-hooks';
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

function AdminState({children}: {children: React.ReactNode}) {
    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper: true}});

        return () => {
            dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper: false}});
        };
    }, [dispatch]);

    return children;
}

const withAdmin: Decorator = (Story) => (
    <AdminState>
        <Story />
    </AdminState>
);

const withAbcControl: Decorator = (Story) => {
    configureUIFactory({
        ...defaultUIFactory,
        renderControlAbcService: ({value, disabled}) => (
            <button disabled={disabled}>{value?.slug || 'Select ABC service...'}</button>
        ),
    });

    return <Story />;
};

const meta: Meta<typeof StoryHost> = {
    title: 'Pages/Accounts/AccountEditorHost',
    component: StoryHost,
    decorators: [withAbcControl],
};

export default meta;
type Story = StoryObj<typeof StoryHost>;

export const Opening: Story = {args: {DataLoader: LoadingDataLoader}};
export const Opened: Story = {args: {DataLoader: LoadedDataLoader}};
export const OpenedAsAdmin: Story = {
    args: {DataLoader: LoadedDataLoader},
    decorators: [withAdmin],
};
export const LoadError: Story = {args: {DataLoader: ErrorDataLoader}};
