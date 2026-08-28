/** @jest-environment jsdom */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';

import type {FlowStateCellHandlers, FlowStateResultRow} from '../types';
import type {FlowReadStatesResponse} from '../../../../../../shared/yt-types';
import {flattenReadStatesResponse, getStateRowId} from '../state-requests';

jest.mock('@ytsaurus/components', () => ({
    ClipboardButton: ({
        text,
        ...props
    }: {text: string} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button data-copy-text={text} {...props} />
    ),
    setLang: () => {},
}));

jest.mock('../../../../../components/NoContent', () => ({
    NoContent: () => <div data-testid="no-content" />,
}));

jest.mock(
    '../../../../../components/AttributesButton/ClickableAttributesButton',
    () =>
        function MockClickableAttributesButton({
            title,
            tooltipProps,
        }: {
            title: string;
            tooltipProps: {content: string};
        }) {
            return <button aria-label={tooltipProps.content} data-modal-title={title} />;
        },
);
jest.mock('../../../../../components/ClickableText/ClickableText', () => ({
    ClickableText: ({children, onClick}: {children: React.ReactNode; onClick: () => void}) => (
        <button onClick={onClick}>{children}</button>
    ),
}));
jest.mock('../../../../../components/Yson/Yson', () => ({
    Yson: () => null,
}));
jest.mock('../../../../../containers/RoutedLink/RoutedLink', () => ({
    RoutedLink: ({children, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a {...props}>{children}</a>
    ),
}));

jest.mock('../../../../../containers/Block/Block', () => ({
    YTErrorBlock: ({error}: {error: {message?: string}}) => (
        <div data-testid="error">{error.message}</div>
    ),
}));

jest.mock('../../../../../store/redux-hooks', () => ({useSelector: () => 'hahn'}));
jest.mock('../../../../../store/selectors/global', () => ({selectCluster: () => 'hahn'}));
jest.mock('../../../../../store/selectors/thor/unipika', () => ({
    selectFlowSpecYsonSettings: () => ({}),
}));

jest.mock('../../../../../components/DataTableGravity', () => ({
    DataTableGravity: ({
        table,
    }: {
        table: {
            columns: Array<{
                id: string;
                cell: (props: {row: {original: FlowStateResultRow}}) => React.ReactNode;
            }>;
            data: Array<FlowStateResultRow>;
            enableMultiRowSelection: boolean;
        };
    }) => (
        <div
            data-testid="results-table"
            data-multi-row-selection={String(table.enableMultiRowSelection)}
        >
            <div data-testid="column-order">{table.columns.map(({id}) => id).join(',')}</div>
            {table.data[0] &&
                table.columns
                    .filter((column) => column.cell)
                    .map((column) => (
                        <div key={column.id} data-column-id={column.id}>
                            {column.cell({row: {original: table.data[0]}})}
                        </div>
                    ))}
        </div>
    ),
    TableCell: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    selectionColumn: {id: 'select', cell: () => <input type="checkbox" />},
    useTable: (options: unknown) => options,
}));

jest.mock('./i18n', () => ({
    __esModule: true,
    default: (key: string) => key,
}));
jest.mock('../i18n-api-values', () => ({
    __esModule: true,
    default: (key: string) => key,
}));

import {FlowStateResults} from './FlowStateResults';

const handlers: FlowStateCellHandlers = {
    getRowFilterUpdate: () => undefined,
    onFiltersChange: () => {},
    resolveStoragePath: () => undefined,
    resolveComputationLink: () => '',
};

function renderResults(props: Partial<React.ComponentProps<typeof FlowStateResults>> = {}) {
    return render(
        <FlowStateResults
            hasScope
            response={undefined}
            initialLoading={false}
            refreshing={false}
            readSucceeded={false}
            handlers={handlers}
            rowSelection={{}}
            onRowSelectionChange={() => {}}
            writeDenied={false}
            onDeleteRows={() => {}}
            {...props}
        />,
    );
}

it('does not render empty results without a scope', () => {
    renderResults({hasScope: false});
    expect(screen.queryByTestId('no-content')).toBeNull();
});

it('renders a loader during the initial scoped read', () => {
    renderResults({initialLoading: true});
    expect(document.querySelector('.g-loader')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toContain('status_loading');
    expect(screen.queryByTestId('no-content')).toBeNull();
});

it('keeps the complete stale result region visible but inert while refreshing', () => {
    const response: FlowReadStatesResponse = {
        key_states: [
            {
                computation_id: 'state',
                key: ['account'],
                states: {'/counter': {count: 42}},
            },
        ],
        errors: ['section failed'],
    };
    const row = flattenReadStatesResponse(response)[0];
    renderResults({
        response,
        refreshing: true,
        rowSelection: {[getStateRowId(row)]: true},
        handlers: {
            ...handlers,
            resolveComputationLink: () => '/hahn/flow/state',
            resolveStoragePath: () => ({cluster: 'hahn', path: '//home/flow/state'}),
        },
    });
    expect(screen.getByTestId('results-table')).not.toBeNull();
    const content = screen.getByTestId('results-content');
    const status = screen.getByRole('status');
    expect(content.getAttribute('aria-busy')).toBe('true');
    expect(content.hasAttribute('inert')).toBe(true);
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('status_refreshing');
    expect(content.contains(status)).toBe(false);
    expect(content.contains(screen.getByText(/text_selected-rows/))).toBe(true);
    expect(content.contains(screen.getByTestId('error'))).toBe(true);
    expect(content.contains(screen.getByRole('button', {name: 'label_bounded-results-info'}))).toBe(
        true,
    );
    expect(content.contains(screen.getByRole('button', {name: 'tooltip_show-raw-response'}))).toBe(
        true,
    );
    expect(content.contains(screen.getByRole('button', {name: 'action_delete'}))).toBe(true);
    expect(content.contains(screen.getByRole('button', {name: 'action_delete-row'}))).toBe(true);
    expect(content.contains(screen.getByRole('button', {name: 'action_copy-value'}))).toBe(true);
    expect(content.contains(screen.getByRole('button', {name: 'tooltip_show-value'}))).toBe(true);
    expect(content.contains(screen.getByTitle('link_open-computation-page'))).toBe(true);
    expect(content.contains(screen.getByLabelText('link_open-backing-storage'))).toBe(true);
    expect(screen.queryByTestId('no-content')).toBeNull();
});

it('renders a transport error instead of empty results', () => {
    renderResults({error: {message: 'transport failed'}});
    expect(screen.getByTestId('error').textContent).toContain('transport failed');
    expect(screen.queryByTestId('no-content')).toBeNull();
});

it('renders NoContent after a successful empty read', () => {
    renderResults({response: {}, readSucceeded: true});
    expect(screen.getByTestId('no-content')).not.toBeNull();
});

it('does not render NoContent when the response contains section errors', () => {
    renderResults({response: {errors: ['section failed']}, readSucceeded: true});
    expect(screen.getByTestId('error').textContent).toContain('section failed');
    expect(screen.queryByTestId('no-content')).toBeNull();
});

it('keeps copy and inspection on Value only and exposes raw response inspection', () => {
    const response: FlowReadStatesResponse = {
        key_states: [
            {
                computation_id: 'state',
                key: ['account'],
                states: {'/counter': {count: 42}},
            },
        ],
    };

    renderResults({response});

    expect(document.querySelectorAll('[data-copy-text]')).toHaveLength(1);
    const copy = screen.getByRole('button', {name: 'action_copy-value'});
    copy.focus();
    expect(document.activeElement).toBe(copy);
    expect(document.querySelector('[data-copy-text]')?.getAttribute('data-copy-text')).toContain(
        'count',
    );
    expect(screen.getByRole('button', {name: 'tooltip_show-value'})).not.toBeNull();
    const valueActions = document.querySelector('[data-column-id="value"]');
    expect(
        Array.from(valueActions?.querySelectorAll('button') ?? []).map((button) =>
            button.getAttribute('aria-label'),
        ),
    ).toEqual(['tooltip_show-value', 'action_copy-value']);
    expect(screen.getByRole('button', {name: 'tooltip_show-raw-response'})).not.toBeNull();
    expect(
        screen
            .getByRole('button', {name: 'tooltip_show-raw-response'})
            .getAttribute('data-modal-title'),
    ).toBe('title_raw-response');
});

it('keeps computation and backing storage navigation persistently accessible', () => {
    const response: FlowReadStatesResponse = {
        key_states: [{computation_id: 'state', key: ['account'], states: {'/counter': 42}}],
    };

    renderResults({
        response,
        handlers: {
            ...handlers,
            resolveComputationLink: () => '/hahn/flow/state',
            resolveStoragePath: () => ({cluster: 'hahn', path: '//home/flow/state'}),
        },
    });

    expect(screen.getByTitle('link_open-computation-page').getAttribute('href')).toBe(
        '/hahn/flow/state',
    );
    expect(screen.getByLabelText('link_open-backing-storage').getAttribute('href')).toContain(
        '//home/flow/state',
    );
});

it('describes the bounded response without presenting a row count or raw switch', () => {
    renderResults({response: {partition_states: []}});

    expect(screen.getByRole('button', {name: 'label_bounded-results-info'})).not.toBeNull();
    expect(screen.queryByText(/label_rows/)).toBeNull();
});

it('enables multi-row selection and exposes a rightmost row delete action', () => {
    const onDeleteRows = jest.fn();
    renderResults({
        response: {
            key_states: [{computation_id: 'state', key: [1], states: {'/counter': 42}}],
        },
        onDeleteRows,
    });

    const rowDeleteButton = screen.getByRole('button', {name: 'action_delete-row'});
    rowDeleteButton.focus();
    expect(document.activeElement).toBe(rowDeleteButton);
    fireEvent.click(rowDeleteButton);

    expect(screen.getByTestId('results-table').dataset.multiRowSelection).toBe('true');
    expect(onDeleteRows).toHaveBeenCalledWith([
        expect.objectContaining({section: 'key_state', stateName: '/counter'}),
    ]);
});

it('orders columns and omits every write control when permission is unavailable', () => {
    renderResults({
        response: {
            key_states: [{computation_id: 'state', key: [1], states: {'/counter': 42}}],
        },
        writeDenied: true,
        rowSelection: {'key_state|state||[1]|/counter': true},
    });

    expect(screen.getByTestId('column-order').textContent).toBe(
        'computation,section,state-name,partition,key,value',
    );
    expect(screen.queryByRole('button', {name: 'action_delete'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'action_delete-row'})).toBeNull();
});

it('keeps all filterable row coordinates clickable, including an active partition', () => {
    const onFiltersChange = jest.fn();
    const update = {target: 'all' as const, keyValues: {}, partitionId: 'p1'};
    renderResults({
        response: {
            partition_states: [
                {computation_id: 'state', partition_id: 'p1', states: {'/counter': 42}},
            ],
        },
        handlers: {
            ...handlers,
            getRowFilterUpdate: () => update,
            onFiltersChange,
        },
    });

    for (const label of ['state', 'value_kind-internal-partition', '/counter', 'p1']) {
        fireEvent.click(screen.getByRole('button', {name: label}));
    }
    expect(onFiltersChange).toHaveBeenCalledTimes(4);
});
