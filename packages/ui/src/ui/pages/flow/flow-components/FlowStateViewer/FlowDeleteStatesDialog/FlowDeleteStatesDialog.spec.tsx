/** @jest-environment jsdom */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';

import type {FlowStateResultRow} from '../types';
import type {GetPipelineStateData} from '../../../../../../shared/yt-types';

const mockUsePipelineState = jest.fn();
const mockFlowDeleteStates = jest.fn();

jest.mock('../../../../../i18n', () => ({
    __esModule: true,
    addI18Keysets: () => (key: string) => key,
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
jest.mock('../../../../../containers/Dialog', () => ({
    YTDFDialog: (() => {
        const MockReact = jest.requireActual('react');
        return function MockYTDFDialog(props: {
            visible: boolean;
            fields: Array<{name: string; type: string; extras?: {children?: React.ReactNode}}>;
            initialValues: {force: boolean};
            isApplyDisabled: (state: {values: {force: boolean}; submitting: boolean}) => boolean;
            onAdd: (form: {getState: () => {values: {force: boolean}}}) => Promise<void>;
            onClose: () => void;
            footerProps: {textApply: string; textCancel: string};
        }) {
            const [force, setForce] = MockReact.useState(props.initialValues.force);
            const [submitting, setSubmitting] = MockReact.useState(false);
            if (!props.visible) return null;
            return (
                <div role="dialog">
                    {props.fields.map((field) =>
                        field.type === 'checkbox' ? (
                            <label key={field.name}>
                                <input
                                    type="checkbox"
                                    checked={force}
                                    onChange={(event) => setForce(event.target.checked)}
                                />
                                {field.extras?.children}
                            </label>
                        ) : (
                            <MockReact.Fragment key={field.name}>
                                {field.extras?.children}
                            </MockReact.Fragment>
                        ),
                    )}
                    <button onClick={props.onClose}>{props.footerProps.textCancel}</button>
                    <button
                        disabled={props.isApplyDisabled({values: {force}, submitting})}
                        onClick={async () => {
                            setSubmitting(true);
                            await props.onAdd({getState: () => ({values: {force}})});
                            setSubmitting(false);
                        }}
                    >
                        {props.footerProps.textApply}
                    </button>
                </div>
            );
        };
    })(),
}));

import {FlowDeleteStatesDialog} from './FlowDeleteStatesDialog';

const rows: Array<FlowStateResultRow> = [
    {section: 'key_state', computationId: 'state', key: [1], stateName: '/counter', value: 1},
    {section: 'key_state', computationId: 'state', key: [2], stateName: '/other', value: 2},
];

function deleteButton() {
    return screen.getByRole('button', {name: 'action_delete'}) as HTMLButtonElement;
}

function renderDialog(
    pipelineState: GetPipelineStateData | undefined,
    options: {onClose?: jest.Mock; onCommitted?: jest.Mock; isFetching?: boolean} = {},
) {
    mockUsePipelineState.mockReturnValue({
        data: pipelineState,
        error: undefined,
        isFetching: options.isFetching ?? false,
    });
    const onClose = options.onClose ?? jest.fn();
    const onCommitted = options.onCommitted ?? jest.fn();
    render(
        <FlowDeleteStatesDialog
            visible
            onClose={onClose}
            pipeline_path="//pipeline"
            rows={rows}
            onCommitted={onCommitted}
        />,
    );
    return {onClose, onCommitted};
}

beforeEach(() => {
    jest.clearAllMocks();
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
    expect(deleteButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(deleteButton().disabled).toBe(false);
    await act(async () => fireEvent.click(deleteButton()));

    expect(mockFlowDeleteStates).toHaveBeenCalledWith({
        parameters: {pipeline_path: '//pipeline'},
        body: expect.objectContaining({commit: true, force: true}),
    });
});

it('Cancel sends no delete requests', () => {
    const {onClose} = renderDialog('Stopped');
    fireEvent.click(screen.getByRole('button', {name: 'action_cancel'}));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockFlowDeleteStates).not.toHaveBeenCalled();
});

it('keeps the dialog open and reports outcomes after a partial failure', async () => {
    mockFlowDeleteStates
        .mockResolvedValueOnce({committed: true})
        .mockResolvedValueOnce({committed: false, errors: ['locked']});
    const callbacks = renderDialog('Stopped');

    await act(async () => fireEvent.click(deleteButton()));

    expect(callbacks.onCommitted).not.toHaveBeenCalled();
    expect(callbacks.onClose).not.toHaveBeenCalled();
    expect(screen.getByText('alert_delete-failed')).not.toBeNull();
    expect(screen.getByText('locked')).not.toBeNull();
});

it('disables Delete while pipeline state is loading', () => {
    renderDialog(undefined, {isFetching: true});
    expect(deleteButton().disabled).toBe(true);
});
