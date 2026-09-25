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
import {prepareAccountEditorData} from '../prepareAccountEditorData';
import {type AccountEditorChange} from '../types';
import {toaster} from '../../../../utils/toaster';

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

function StoryHost({DataLoader}: {DataLoader?: React.ComponentType<AccountEditorDataLoaderProps>}) {
    const [events, setEvents] = React.useState<Array<string>>([]);
    const handleChanged = React.useCallback((change: AccountEditorChange) => {
        setEvents((current) => [...current, change.kind]);
    }, []);
    const handleDeleted = React.useCallback((name: string) => {
        setEvents((current) => [...current, `deleted:${name}`]);
    }, []);

    return (
        <ToasterProvider toaster={toaster}>
            <AccountEditorHost
                DataLoader={DataLoader}
                onChanged={handleChanged}
                onDeleted={handleDeleted}
            >
                <EditorButtons />
            </AccountEditorHost>
            <div data-qa="editor-events">{events.join(',')}</div>
            <ToasterComponent />
        </ToasterProvider>
    );
}

function AdminState({children}: {children: React.ReactNode}) {
    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper: true, mediumList: ['default']}});

        return () => {
            dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper: false, mediumList: []}});
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
export const LoadedThroughApi: Story = {};
export const LoadedThroughApiAsAdmin: Story = {decorators: [withAdmin]};

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

export const OpeningLifecycle: Story = {render: () => <LifecycleStory />};
