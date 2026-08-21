/** @jest-environment jsdom */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';

import type {FlowReadStatesResponse} from '../../../../../../shared/yt-types';
import type {FlowStateResultRow} from '../types';

let mockResponse: FlowReadStatesResponse;

jest.mock('../../../../../store/redux-hooks', () => ({useSelector: () => 'user'}));
jest.mock('../../../../../store/selectors/global', () => ({selectCurrentUserName: () => 'user'}));
jest.mock('../../../../../store/api/yt/checkPermissions', () => ({
    useCheckPermissionQuery: () => ({data: {action: 'allow'}}),
}));
jest.mock('../../../../../rum/rum-wrap-api', () => ({YTApiId: {checkPermissions: 'check'}}));
jest.mock('./i18n', () => ({__esModule: true, default: (key: string) => key}));
jest.mock('../FlowStateFilters/FlowStateFilters', () => ({FlowStateFilters: () => null}));
jest.mock('./use-flow-state-cell-handlers', () => ({useFlowStateCellHandlers: () => ({})}));
jest.mock('./use-flow-state-read', () => ({
    useFlowStateRead: () => ({
        filters: {keyValues: {}, target: 'all'},
        setFilters: jest.fn(),
        staticSpec: undefined,
        hasScope: true,
        validationError: undefined,
        response: mockResponse,
        initialLoading: false,
        refreshing: false,
        readSucceeded: true,
        error: undefined,
        refetch: jest.fn(),
    }),
}));
jest.mock('../FlowStateResults/FlowStateResults', () => ({
    FlowStateResults: ({
        response: currentResponse,
        rowSelection,
        onRowSelectionChange,
        onDeleteRows,
    }: {
        response: FlowReadStatesResponse;
        rowSelection: Record<string, boolean>;
        onRowSelectionChange: (selection: Record<string, boolean>) => void;
        onDeleteRows: (rows: Array<FlowStateResultRow>) => void;
    }) => (
        <div>
            <span data-testid="selected-count">
                {Object.values(rowSelection).filter(Boolean).length}
            </span>
            <button
                onClick={() =>
                    onRowSelectionChange({
                        'key_state|state||[1]|/first': true,
                        'key_state|state||[2]|/second': true,
                    })
                }
            >
                Select two
            </button>
            <button
                onClick={() =>
                    onDeleteRows([
                        {
                            section: 'key_state',
                            computationId: currentResponse.key_states?.[0].computation_id,
                            key: [1],
                            stateName: '/first',
                            value: 1,
                        },
                        {
                            section: 'key_state',
                            computationId: currentResponse.key_states?.[0].computation_id,
                            key: [2],
                            stateName: '/second',
                            value: 2,
                        },
                    ])
                }
            >
                Delete selected
            </button>
            <button
                onClick={() =>
                    onDeleteRows([
                        {
                            section: 'key_state',
                            computationId: currentResponse.key_states?.[0].computation_id,
                            key: [1],
                            stateName: '/first',
                            value: 1,
                        },
                    ])
                }
            >
                Delete first row
            </button>
        </div>
    ),
}));
jest.mock('../FlowDeleteStatesDialog/FlowDeleteStatesDialog', () => ({
    FlowDeleteStatesDialog: ({
        visible,
        rows,
    }: {
        visible: boolean;
        rows: Array<FlowStateResultRow>;
    }) =>
        visible ? <div role="dialog">{rows.map(({stateName}) => stateName).join(',')}</div> : null,
}));

import {FlowStateSection} from './FlowStateSection';

function makeResponse(): FlowReadStatesResponse {
    return {
        key_states: [
            {computation_id: 'state', key: [1], states: {'/first': 1}},
            {computation_id: 'state', key: [2], states: {'/second': 2}},
        ],
    };
}

it('keeps two selected rows across a response identity refresh and deletes them together', () => {
    mockResponse = makeResponse();
    const view = render(<FlowStateSection pipeline_path="//pipeline" />);

    fireEvent.click(screen.getByRole('button', {name: 'Select two'}));
    expect(screen.getByTestId('selected-count').textContent).toBe('2');

    mockResponse = makeResponse();
    view.rerender(<FlowStateSection pipeline_path="//pipeline" />);
    expect(screen.getByTestId('selected-count').textContent).toBe('2');

    fireEvent.click(screen.getByRole('button', {name: 'Delete selected'}));
    expect(screen.getByRole('dialog').textContent).toContain('/first');
    expect(screen.getByRole('dialog').textContent).toContain('/second');
});

it('opens the shared confirmation for one row', () => {
    mockResponse = makeResponse();
    render(<FlowStateSection pipeline_path="//pipeline" />);

    fireEvent.click(screen.getByRole('button', {name: 'Delete first row'}));

    expect(screen.getByRole('dialog').textContent).toContain('/first');
    expect(screen.getByRole('dialog').textContent).not.toContain('/second');
});
