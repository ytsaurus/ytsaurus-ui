/** @jest-environment jsdom */
import React from 'react';
import {act, fireEvent, render, renderHook, screen, waitFor, within} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';

import type {FlowStateResultRow} from '../types';
import {serializeRawStateValue} from '../state-values';
import type {GetPipelineStateData} from '../../../../../../shared/yt-types';

const mockUsePipelineState = jest.fn();
const mockFlowDeleteStates = jest.fn();
const mockPermissionRefetch = jest.fn();
const mockPipelineStateRefetch = jest.fn();

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(global as unknown as {ResizeObserver: unknown}).ResizeObserver = ResizeObserverStub;

window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;

jest.mock('@ytsaurus/components', () => ({
    ClipboardButton: ({
        text,
        ...props
    }: {text: string} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button data-copy-text={text} {...props} />
    ),
    YTText: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
    setLang: () => {},
}));
jest.mock('../../../../../i18n', () => ({
    __esModule: true,
    addI18Keysets: () => (key: string, params?: Record<string, string>) =>
        params ? `${key}:${JSON.stringify(params)}` : key,
}));
jest.mock('../../../../../containers/Block/Block', () => ({
    YTErrorBlock: ({error}: {error: {message?: string}}) => <div>{error?.message}</div>,
}));
jest.mock('../FlowStateResults/FlowStateResults', () => ({
    KIND_LABEL_KEYS: {
        key_state: 'key',
        partition_state: 'partition',
        external_key_state: 'external',
        joined_external_key_state: 'joined',
    },
}));
jest.mock('../../../../../store/api/yt/flow', () => ({
    useFlowPipelineStateQuery: (...args: Array<unknown>) => mockUsePipelineState(...args),
    useFlowDeleteStatesMutation: () => [
        (args: unknown) => ({unwrap: () => mockFlowDeleteStates(args)}),
    ],
}));
import {FlowDeleteStatesDialog} from './FlowDeleteStatesDialog';
import {useFlowDeleteStates} from './use-flow-delete-states';

const rows: Array<FlowStateResultRow> = [
    {section: 'key_state', computationId: 'state', key: [1], stateName: '/counter', value: 1},
    {section: 'key_state', computationId: 'state', key: [2], stateName: '/other', value: 2},
];

function deleteButton() {
    return screen.getByRole('button', {name: 'action_delete'}) as HTMLButtonElement;
}

function renderDialog(
    pipelineState: GetPipelineStateData | undefined,
    options: {
        onClose?: jest.Mock;
        onCommitted?: jest.Mock;
        isFetching?: boolean;
        pipelineError?: unknown;
        permission?: {data?: {action?: 'allow' | 'deny'}; error?: unknown; isFetching?: boolean};
        rows?: Array<FlowStateResultRow>;
    } = {},
) {
    mockUsePipelineState.mockReturnValue({
        data: pipelineState,
        error: options.pipelineError,
        isFetching: options.isFetching ?? false,
        refetch: mockPipelineStateRefetch,
    });
    const permission = {
        data: {action: 'allow' as const},
        error: undefined,
        isFetching: false,
        refetch: mockPermissionRefetch,
        ...options.permission,
    };
    const onClose = options.onClose ?? jest.fn();
    const onCommitted = options.onCommitted ?? jest.fn();
    const dialog = (visible: boolean) => (
        <ThemeProvider theme="light">
            <FlowDeleteStatesDialog
                visible={visible}
                onClose={onClose}
                pipeline_path="//pipeline"
                rows={options.rows ?? rows}
                permission={permission}
                onCommitted={onCommitted}
            />
        </ThemeProvider>
    );
    const view = render(dialog(true));
    return {
        onClose,
        onCommitted,
        unmount: view.unmount,
        rerenderVisible: (visible: boolean) => view.rerender(dialog(visible)),
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    mockPermissionRefetch.mockReturnValue({unwrap: () => Promise.resolve({action: 'allow'})});
    mockPipelineStateRefetch.mockReturnValue({unwrap: () => Promise.resolve('Stopped')});
});

it('uses its localized visible header as the dialog accessible name', async () => {
    renderDialog('Stopped');

    const dialog = await screen.findByRole('dialog', {name: 'title_delete-states'});
    const titles = within(dialog).getAllByText('title_delete-states');
    expect(titles).toHaveLength(1);
    expect(titles[0].hidden).toBe(false);
    expect(getComputedStyle(titles[0]).display).not.toBe('none');
    expect(getComputedStyle(titles[0]).visibility).not.toBe('hidden');
    const titleIds = dialog.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
    expect(titleIds).toEqual([titles[0].id]);
    expect(document.querySelectorAll(`[id="${titles[0].id}"]`)).toHaveLength(1);
});

it('sends one-step committed deletes and closes after full success', async () => {
    mockFlowDeleteStates.mockResolvedValue({committed: true});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).toHaveBeenCalledTimes(2);
    expect(mockFlowDeleteStates).toHaveBeenCalledWith({
        parameters: {pipeline_path: '//pipeline'},
        body: expect.objectContaining({commit: true, force: false}),
    });
    expect(callbacks.onCommitted).toHaveBeenCalledTimes(1);
    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
});

it('disables Delete while the pipeline is working', () => {
    renderDialog('Working');
    expect(screen.getByText('alert_pipeline-running')).not.toBeNull();
    expect(deleteButton().disabled).toBe(true);
    fireEvent.click(deleteButton());
    expect(mockFlowDeleteStates).not.toHaveBeenCalled();
});

it('requires Force while paused and sends force after confirmation', async () => {
    mockFlowDeleteStates.mockResolvedValue({committed: true});
    renderDialog('Paused');
    expect(screen.queryByText('alert_force-paused')).toBeNull();
    expect(
        screen.getByRole('checkbox', {
            name: 'label_force',
        }),
    ).not.toBeNull();
    expect(deleteButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(deleteButton().disabled).toBe(false);
    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).toHaveBeenCalledWith({
        parameters: {pipeline_path: '//pipeline'},
        body: expect.objectContaining({commit: true, force: true}),
    });
});

it('renders a headed preview with complete copyable values and plain permanence text', () => {
    renderDialog('Stopped');

    expect(screen.getByText(/text_delete-selected-explanation/).closest('.g-alert')).toBeNull();
    const headings = ['column_computation', 'column_state-name', 'column_key', 'column_value'];
    for (const heading of headings) {
        expect(screen.getByText(heading)).not.toBeNull();
    }
    const headerRow = screen.getByText(headings[0]).closest('tr');
    expect(Array.from(headerRow?.children ?? []).map((cell) => cell.textContent)).toEqual(headings);
    expect(screen.getAllByRole('button', {name: 'action_copy-value'})).toHaveLength(2);
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.getByRole('dialog').querySelector('.g-dialog_size_l')).not.toBeNull();
});

it('caps the preview at 20 rows and keeps a long value complete and copyable', () => {
    const longValue = 'complete-value-'.repeat(16);
    const expectedLongValue = serializeRawStateValue(longValue);
    const previewRows = Array.from({length: 21}, (_, index): FlowStateResultRow => ({
        section: 'key_state',
        computationId: 'state',
        key: [index],
        stateName: `/state-${index}`,
        value: index === 0 ? longValue : index,
    }));

    renderDialog('Stopped', {rows: previewRows});

    const table = screen.getByText('column_computation').closest('table');
    expect(table?.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('text_and-n-more:{"count":"1"}')).not.toBeNull();
    expect(screen.getByText(expectedLongValue)).not.toBeNull();
    expect(
        screen
            .getAllByRole('button', {name: 'action_copy-value'})[0]
            .getAttribute('data-copy-text'),
    ).toBe(expectedLongValue);
});

it('Cancel sends no delete requests', () => {
    const {onClose} = renderDialog('Stopped');
    fireEvent.click(screen.getByRole('button', {name: 'action_cancel'}));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockFlowDeleteStates).not.toHaveBeenCalled();
});

it('routes every idle close path through onClose', async () => {
    const {onClose} = renderDialog('Stopped');
    const dialog = await screen.findByRole('dialog', {name: 'title_delete-states'});
    const closeButton = within(dialog).getByRole('button', {name: 'action_close'});
    expect(within(dialog).getAllByRole('button', {name: 'action_close'})).toHaveLength(1);
    expect(within(dialog).queryByRole('button', {name: 'Close dialog'})).toBeNull();
    expect(within(dialog).queryByRole('button', {name: '[object Object]'})).toBeNull();

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.pointerDown(document.querySelector('.g-modal') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole('button', {name: 'action_cancel'}));
    expect(onClose).toHaveBeenCalledTimes(4);
});

it('keeps the dialog open and reports outcomes after a partial failure', async () => {
    mockFlowDeleteStates
        .mockResolvedValueOnce({committed: true})
        .mockResolvedValueOnce({committed: false, errors: ['locked']});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(callbacks.onCommitted).toHaveBeenCalledWith(
        [
            expect.objectContaining({response: {committed: true}}),
            expect.objectContaining({response: {committed: false, errors: ['locked']}}),
        ],
        false,
    );
    expect(callbacks.onClose).not.toHaveBeenCalled();
    expect(screen.getAllByText('alert_delete-failed')).toHaveLength(2);
    expect(screen.getByText('locked')).not.toBeNull();
});

it('retries only unresolved rows while retaining cumulative committed outcomes', async () => {
    mockFlowDeleteStates
        .mockResolvedValueOnce({committed: true})
        .mockResolvedValueOnce({committed: false, errors: ['locked']})
        .mockResolvedValueOnce({committed: true});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(screen.getByText(/text_deleted-count/).textContent).toContain('1');
    expect(callbacks.onCommitted).toHaveBeenNthCalledWith(
        1,
        [
            expect.objectContaining({response: {committed: true}}),
            expect.objectContaining({response: {committed: false, errors: ['locked']}}),
        ],
        false,
    );

    await waitFor(() => expect(deleteButton().disabled).toBe(false));
    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).toHaveBeenCalledTimes(3);
    expect(mockFlowDeleteStates.mock.calls.map(([{body}]) => body.key)).toEqual([[1], [2], [2]]);
    expect(callbacks.onCommitted).toHaveBeenNthCalledWith(
        2,
        [expect.objectContaining({response: {committed: true}})],
        true,
    );
    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
});

it('replaces only the unresolved row failure and skips zero-commit reconciliation', async () => {
    mockFlowDeleteStates
        .mockResolvedValueOnce({committed: true})
        .mockResolvedValueOnce({committed: false, errors: ['locked']})
        .mockResolvedValueOnce({committed: false, errors: ['still locked']});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));
    await waitFor(() => expect(deleteButton().disabled).toBe(false));
    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates.mock.calls.map(([{body}]) => body.key)).toEqual([[1], [2], [2]]);
    expect(callbacks.onCommitted).toHaveBeenCalledTimes(1);
    expect(callbacks.onClose).not.toHaveBeenCalled();
    expect(screen.queryByText('locked')).toBeNull();
    expect(screen.getByText('still locked')).not.toBeNull();
    expect(screen.getByText(/text_deleted-count/).textContent).toContain('1');
});

it('disables Delete while pipeline state is loading', () => {
    renderDialog(undefined, {isFetching: true});
    expect(deleteButton().disabled).toBe(true);
});

it('disables Delete for a cached Stopped state with a query error', () => {
    renderDialog('Stopped', {pipelineError: new Error('state unavailable')});
    expect(deleteButton().disabled).toBe(true);
});

it('keeps cached permission stable while it refreshes in the background', () => {
    renderDialog('Stopped', {permission: {data: {action: 'allow'}, isFetching: true}});
    expect(deleteButton().disabled).toBe(false);
    expect(screen.queryByText('alert_permission-unavailable')).toBeNull();
});

it('issues no mutation when fresh permission is revoked at Apply time', async () => {
    mockPermissionRefetch.mockReturnValue({unwrap: () => Promise.resolve({action: 'deny'})});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).not.toHaveBeenCalled();
    expect(callbacks.onCommitted).not.toHaveBeenCalled();
    expect(callbacks.onClose).not.toHaveBeenCalled();
});

it('issues no mutation when the fresh pipeline state becomes Working', async () => {
    mockPipelineStateRefetch.mockReturnValue({unwrap: () => Promise.resolve('Working')});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).not.toHaveBeenCalled();
    expect(callbacks.onCommitted).not.toHaveBeenCalled();
    expect(callbacks.onClose).not.toHaveBeenCalled();
});

it('issues no mutation when a fresh gate request fails', async () => {
    mockPermissionRefetch.mockReturnValue({
        unwrap: () => Promise.reject(new Error('permission unavailable')),
    });
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).not.toHaveBeenCalled();
    expect(callbacks.onCommitted).not.toHaveBeenCalled();
    expect(callbacks.onClose).not.toHaveBeenCalled();
});

it('blocks Cancel, Escape, header and backdrop close while submitting, then closes once', async () => {
    let resolveFirstDelete: ((value: {committed: true}) => void) | undefined;
    mockFlowDeleteStates
        .mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveFirstDelete = resolve;
                }),
        )
        .mockResolvedValue({committed: true});
    const callbacks = renderDialog('Stopped');

    fireEvent.click(deleteButton());
    await act(async () => Promise.resolve());
    fireEvent.click(screen.getByRole('button', {name: 'action_cancel'}));
    fireEvent.keyDown(document, {key: 'Escape'});
    fireEvent.click(screen.getByRole('button', {name: 'action_close'}));
    fireEvent.pointerDown(document.querySelector('.g-modal') as HTMLElement);
    expect(callbacks.onClose).not.toHaveBeenCalled();

    await act(async () => {
        resolveFirstDelete?.({committed: true});
    });

    expect(callbacks.onCommitted).toHaveBeenCalledTimes(1);
    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
});

it('clears Force and the previous failure when reopened', async () => {
    mockFlowDeleteStates
        .mockResolvedValueOnce({committed: true})
        .mockResolvedValueOnce({committed: false, errors: ['locked']});
    const callbacks = renderDialog('Paused');

    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => fireEvent.click(deleteButton()));
    expect(screen.getByText('locked')).not.toBeNull();

    callbacks.rerenderVisible(false);
    callbacks.rerenderVisible(true);

    await waitFor(() =>
        expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false),
    );
    expect(screen.queryByText('locked')).toBeNull();
    expect(deleteButton().disabled).toBe(true);
});

it('rejects an old in-flight delete session after the dialog closes', async () => {
    let resolveDelete: ((value: {committed: true}) => void) | undefined;
    mockFlowDeleteStates
        .mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveDelete = resolve;
                }),
        )
        .mockResolvedValue({committed: true});
    mockUsePipelineState.mockReturnValue({
        data: 'Stopped',
        error: undefined,
        isFetching: false,
        refetch: mockPipelineStateRefetch,
    });
    const permission = {
        data: {action: 'allow' as const},
        error: undefined,
        isFetching: false,
        refetch: mockPermissionRefetch,
    };
    const {result, rerender} = renderHook(
        ({visible}) =>
            useFlowDeleteStates({visible, pipeline_path: '//pipeline', rows, permission}),
        {initialProps: {visible: true}},
    );

    let pending: ReturnType<typeof result.current.runDeleteStates> | undefined;
    await act(async () => {
        pending = result.current.runDeleteStates(false);
        await Promise.resolve();
    });
    rerender({visible: false});
    await act(async () => resolveDelete?.({committed: true}));

    await expect(pending).resolves.toEqual(expect.objectContaining({status: 'stale'}));
});

it('rejects an in-flight delete session after the controller unmounts', async () => {
    let resolveDelete: ((value: {committed: true}) => void) | undefined;
    mockFlowDeleteStates
        .mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveDelete = resolve;
                }),
        )
        .mockResolvedValue({committed: true});
    mockUsePipelineState.mockReturnValue({
        data: 'Stopped',
        error: undefined,
        isFetching: false,
        refetch: mockPipelineStateRefetch,
    });
    const permission = {
        data: {action: 'allow' as const},
        error: undefined,
        isFetching: false,
        refetch: mockPermissionRefetch,
    };
    const {result, unmount} = renderHook(() =>
        useFlowDeleteStates({visible: true, pipeline_path: '//pipeline', rows, permission}),
    );

    let pending: ReturnType<typeof result.current.runDeleteStates> | undefined;
    await act(async () => {
        pending = result.current.runDeleteStates(false);
        await Promise.resolve();
    });
    unmount();
    await act(async () => resolveDelete?.({committed: true}));

    await expect(pending).resolves.toEqual(expect.objectContaining({status: 'stale'}));
    expect(mockFlowDeleteStates).toHaveBeenCalledTimes(1);
});

it('suppresses dialog continuations after unmounting during Apply', async () => {
    let resolveDelete: ((value: {committed: true}) => void) | undefined;
    mockFlowDeleteStates
        .mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveDelete = resolve;
                }),
        )
        .mockResolvedValue({committed: true});
    const callbacks = renderDialog('Stopped');

    fireEvent.click(deleteButton());
    await act(async () => Promise.resolve());
    callbacks.unmount();
    await act(async () => resolveDelete?.({committed: true}));

    expect(callbacks.onCommitted).not.toHaveBeenCalled();
    expect(callbacks.onClose).not.toHaveBeenCalled();
    expect(mockFlowDeleteStates).toHaveBeenCalledTimes(1);
});
