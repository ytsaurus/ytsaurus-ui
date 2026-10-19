import React, {useEffect, useLayoutEffect, useState} from 'react';
import {type Decorator, type Meta, type StoryObj} from '@storybook/react';
import {ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import {GLOBAL_PARTIAL} from '../../../../constants/global';
import {useDispatch} from '../../../../store/redux-hooks';
import {AccountEditButton} from '../AccountEditButton';
import {useAccountEditor} from '../AccountEditorContext';
import {AccountEditorHost} from '../AccountEditorHost';
import {accountEditorHandlers, accountEditorLoadingHandlers} from './mocks';
import {toaster} from '../../../../utils/toaster';

const accountName = 'account';

function EditorButtons() {
    const {openAccount} = useAccountEditor();

    useEffect(() => {
        openAccount(accountName);
    }, [openAccount]);

    return (
        <div style={{display: 'flex', gap: 8}}>
            <AccountEditButton accountName={accountName}>Edit account</AccountEditButton>
            <AccountEditButton accountName="another-account">Edit another</AccountEditButton>
            <AccountEditButton accountName="root">Edit root</AccountEditButton>
        </div>
    );
}

function StoryHost() {
    return (
        <ToasterProvider toaster={toaster}>
            <AccountEditorHost>
                <EditorButtons />
            </AccountEditorHost>
            <ToasterComponent />
        </ToasterProvider>
    );
}

function AdminState({children}: {children: React.ReactNode}) {
    const dispatch = useDispatch();

    useLayoutEffect(() => {
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

const meta: Meta<typeof StoryHost> = {
    title: 'Pages/Accounts/AccountEditorHost',
    component: StoryHost,
    parameters: {msw: {handlers: accountEditorHandlers}},
};

export default meta;
type Story = StoryObj<typeof StoryHost>;

export const Opening: Story = {parameters: {msw: {handlers: accountEditorLoadingHandlers}}};
export const Opened: Story = {};
export const OpenedAsAdmin: Story = {
    decorators: [withAdmin],
};
export const LoadedThroughApi: Story = {};

function LifecycleControls() {
    const {openAccount, closeAccount, openingAccountName, openedAccountName} = useAccountEditor();
    let result = 'idle';
    if (openingAccountName) {
        result = 'pending';
    } else if (openedAccountName) {
        result = 'opened';
    }

    return (
        <>
            <button onClick={() => openAccount(accountName)}>Open</button>
            <button onClick={closeAccount}>Cancel</button>
            <div data-qa="opening-result">{result}</div>
        </>
    );
}

function LifecycleStory() {
    const [mounted, setMounted] = useState(true);

    return (
        <>
            {mounted && (
                <AccountEditorHost>
                    <LifecycleControls />
                </AccountEditorHost>
            )}
            <button onClick={() => setMounted(false)}>Unmount host</button>
            {!mounted && <div data-qa="opening-result">unmounted</div>}
        </>
    );
}

export const OpeningLifecycle: Story = {render: () => <LifecycleStory />};
