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

function LifecycleControls({onSettled}: {onSettled: (result: string) => void}) {
    const {openAccount, closeAccount} = useAccountEditor();
    return (
        <>
            <button
                onClick={() => {
                    onSettled('pending');
                    openAccount(accountName).then(
                        () => onSettled('opened'),
                        (error: Error) => onSettled(error.name),
                    );
                }}
            >
                Open
            </button>
            <button onClick={closeAccount}>Cancel</button>
        </>
    );
}

function LifecycleStory() {
    const [mounted, setMounted] = React.useState(true);
    const [result, setResult] = React.useState('idle');
    const loaderRef = React.useRef<AccountEditorDataLoaderProps>();
    const ManualLoader = React.useCallback(function ManualLoader(
        props: AccountEditorDataLoaderProps,
    ) {
        React.useEffect(() => {
            loaderRef.current = props;
        }, [props]);
        return null;
    }, []);

    return (
        <>
            {mounted && (
                <AccountEditorHost DataLoader={ManualLoader}>
                    <LifecycleControls onSettled={setResult} />
                </AccountEditorHost>
            )}
            <button onClick={() => setMounted(false)}>Unmount host</button>
            <button onClick={() => loaderRef.current?.onLoaded(accountName, editorData)}>
                Deliver data
            </button>
            <div data-qa="opening-result">{result}</div>
        </>
    );
}

export const OpeningLifecycle: Story = {
    args: {DataLoader: LoadingDataLoader},
    render: () => <LifecycleStory />,
};
