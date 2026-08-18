/**
 * @jest-environment jsdom
 */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';

import type {FlowStateResultRow} from '../types';
import type {GetPipelineStateData} from '../../../../../../shared/yt-types';

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

const mockUsePipelineState = jest.fn();
const mockFlowDeleteStates = jest.fn();

jest.mock('../../../../../i18n', () => ({
    __esModule: true,
    addI18Keysets: () => (key: string) => key,
}));

jest.mock('../../../../../containers/Block/Block', () => ({
    __esModule: true,
    YTErrorBlock: ({error}: {error: {message?: string}}) => <div>{error?.message}</div>,
}));

jest.mock('../FlowStateResults/FlowStateResults', () => ({
    __esModule: true,
    KIND_LABEL_KEYS: {
        key_state: 'value_kind-internal-key',
        partition_state: 'value_kind-internal-partition',
        external_key_state: 'value_kind-external-key',
        joined_external_key_state: 'value_kind-joined-external-key',
    },
}));

jest.mock('../../../../../store/api/yt/flow', () => ({
    __esModule: true,
    useFlowPipelineStateQuery: (...args: Array<unknown>) => mockUsePipelineState(...args),
    useFlowDeleteStatesMutation: () => [
        (args: unknown) => ({unwrap: () => mockFlowDeleteStates(args)}),
    ],
}));

import {FlowDeleteStatesDialog} from './FlowDeleteStatesDialog';

const rows: Array<FlowStateResultRow> = [
    {section: 'key_state', computationId: 'state', key: [1], stateName: '/counter', value: 1},
];

const previewResponse = {committed: false, matched_states: {key_states: {total: 3}}};
const committedResponse = {committed: true, matched_states: {key_states: {total: 3}}};

function deleteButton() {
    return screen.getByRole('button', {name: 'action_delete'}) as HTMLButtonElement;
}

function previewButton() {
    return screen.getByRole('button', {name: 'action_preview'}) as HTMLButtonElement;
}

async function renderDialog(pipelineState: GetPipelineStateData, onCommitted = jest.fn()) {
    mockUsePipelineState.mockReturnValue({
        data: pipelineState,
        error: undefined,
        isFetching: false,
    });
    await act(async () => {
        render(
            <ThemeProvider theme="light">
                <FlowDeleteStatesDialog
                    visible
                    onClose={jest.fn()}
                    pipeline_path="//pipeline"
                    rows={rows}
                    onCommitted={onCommitted}
                />
            </ThemeProvider>,
        );
    });
    return onCommitted;
}

async function runPreview() {
    mockFlowDeleteStates.mockResolvedValue(previewResponse);
    await act(async () => {
        fireEvent.click(previewButton());
    });
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('FlowDeleteStatesDialog delete gate', () => {
    it('keeps delete disabled until a preview succeeds, then commits the delete', async () => {
        const onCommitted = await renderDialog('Stopped');

        expect(deleteButton().disabled).toBe(true);

        await runPreview();

        expect(deleteButton().disabled).toBe(false);

        mockFlowDeleteStates.mockResolvedValue(committedResponse);
        await act(async () => {
            fireEvent.click(deleteButton());
        });

        expect(mockFlowDeleteStates).toHaveBeenLastCalledWith({
            parameters: {pipeline_path: '//pipeline'},
            body: expect.objectContaining({commit: true, force: false, name: '/counter'}),
        });
        expect(onCommitted).toHaveBeenCalledTimes(1);
        expect(screen.getByText('text_committed')).not.toBeNull();
    });

    it('blocks preview and delete while the pipeline is working', async () => {
        await renderDialog('Working');

        expect(screen.getByText('alert_pipeline-running')).not.toBeNull();
        expect(previewButton().disabled).toBe(true);
        expect(deleteButton().disabled).toBe(true);

        fireEvent.click(deleteButton());

        expect(mockFlowDeleteStates).not.toHaveBeenCalled();
    });

    it('requires force for a paused pipeline and re-previews after force is toggled', async () => {
        await renderDialog('Paused');

        expect(screen.getByText('alert_force-paused')).not.toBeNull();

        await runPreview();
        expect(deleteButton().disabled).toBe(true);

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox'));
        });
        expect(deleteButton().disabled).toBe(true);

        await runPreview();
        expect(deleteButton().disabled).toBe(false);

        mockFlowDeleteStates.mockResolvedValue(committedResponse);
        await act(async () => {
            fireEvent.click(deleteButton());
        });

        expect(mockFlowDeleteStates).toHaveBeenLastCalledWith({
            parameters: {pipeline_path: '//pipeline'},
            body: expect.objectContaining({commit: true, force: true}),
        });
    });

    it('does not commit when the preview reports row errors', async () => {
        await renderDialog('Stopped');

        mockFlowDeleteStates.mockResolvedValue({committed: false, errors: ['state is locked']});
        await act(async () => {
            fireEvent.click(previewButton());
        });

        expect(deleteButton().disabled).toBe(true);

        fireEvent.click(deleteButton());

        expect(mockFlowDeleteStates).toHaveBeenCalledTimes(1);
    });
});
