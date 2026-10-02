import React from 'react';
import axios from 'axios';

import {loadCreationOptions} from './creation-options-api';
import {useCreationOptions} from './useCreationOptions';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
    useEffect: jest.fn(),
}));
jest.mock('./creation-options-api', () => ({loadCreationOptions: jest.fn()}));
jest.mock('../../../utils/utils', () => ({wrapApiPromiseByToaster: (p: unknown) => p}));
jest.mock('./i18n', () => ({__esModule: true, default: () => 'Load failed'}));

const loadOptions = jest.mocked(loadCreationOptions);

// Drive state and effect commits explicitly: this suite runs in Jest's node environment.
function mountHook(cluster: string, isAdmin: boolean) {
    let currentCluster = cluster;
    let currentIsAdmin = isAdmin;
    let requests: unknown;
    let state: unknown;
    let cleanup: (() => void) | void;
    const setState = jest.fn((next: unknown) => {
        state = next;
    });

    function render(
        nextCluster = currentCluster,
        nextIsAdmin = currentIsAdmin,
        commitEffect = false,
    ) {
        jest.mocked(React.useState)
            .mockImplementationOnce((initial?: unknown): [unknown, React.Dispatch<unknown>] => {
                if (!requests) requests = typeof initial === 'function' ? initial() : initial;
                return [requests, jest.fn()];
            })
            .mockReturnValueOnce([state, setState]);
        // State and effect hooks are mocked above to drive this lifecycle without a DOM.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const result = useCreationOptions(nextCluster, nextIsAdmin);
        if (commitEffect) {
            cleanup?.();
            const calls = jest.mocked(React.useEffect).mock.calls;
            cleanup = calls[calls.length - 1][0]();
        }
        currentCluster = nextCluster;
        currentIsAdmin = nextIsAdmin;
        return result;
    }

    render(cluster, isAdmin, true);
    return {render, unmount: () => cleanup?.()};
}

beforeEach(() => jest.resetAllMocks());

it.each(['admin', 'cluster'] as const)(
    'allows retry after cancelling a load and returning to the original %s context',
    async (context) => {
        let cancelRequest!: (reason: unknown) => void;
        loadOptions.mockImplementationOnce((_cluster, _isAdmin, token) => {
            const pending = new Promise<never>((_resolve, reject) => {
                cancelRequest = reject;
            });
            token.promise.then(cancelRequest);
            return pending;
        });
        const hook = mountHook('original', true);
        const pendingLoad = hook.render().load();
        expect(hook.render().loading).toBe(true);

        hook.render(context === 'cluster' ? 'other' : 'original', context !== 'admin', true);
        hook.render('original', true, true);
        expect(hook.render().loading).toBe(false);
        expect(hook.render().options).toBeUndefined();
        await expect(pendingLoad).resolves.toBe(false);
        expect(axios.isCancel(jest.mocked(loadCreationOptions).mock.calls[0][2].reason)).toBe(true);

        loadOptions.mockResolvedValueOnce({legacy: true});
        await expect(hook.render().load()).resolves.toBe(true);
        expect(hook.render()).toMatchObject({loading: false, options: {legacy: true}});
        hook.unmount();
    },
);
