/** @jest-environment jsdom */
import React from 'react';
import {act, render, screen} from '@testing-library/react';

import type {FlowStaticSpec} from '../../../../../../shared/yt-types';

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(global as unknown as {ResizeObserver: unknown}).ResizeObserver = ResizeObserverStub;

const mockUseStaticSpec = jest.fn();
const mockCollapsibleMessages = jest.fn();

jest.mock('../../../../../store/api/yt/flow', () => ({
    __esModule: true,
    useFlowStaticSpecQuery: (...args: Array<unknown>) => mockUseStaticSpec(...args),
}));

jest.mock('../../../../../store/redux-hooks', () => ({
    useSelector: () => 'hahn',
}));

jest.mock('../../../../../store/selectors/global', () => ({
    selectCluster: () => 'hahn',
}));

jest.mock('../../../../../containers/RoutedLink/RoutedLink', () => ({
    __esModule: true,
    RoutedLink: ({children, href}: {children: React.ReactNode; href?: string}) => (
        <a href={href}>{children}</a>
    ),
}));

jest.mock('../../../../../components/CollapsibleSection/CollapsibleSection', () => ({
    __esModule: true,
    default: ({name, children}: {name: React.ReactNode; children: React.ReactNode}) => (
        <section>
            <h2>{name}</h2>
            {children}
        </section>
    ),
}));

jest.mock(
    '../../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible',
    () => ({
        FlowMessagesCollapsible: (props: {messages?: Array<{text?: string}>}) => {
            mockCollapsibleMessages(props.messages);
            return <div>{props.messages?.map((item) => item.text).join(',')}</div>;
        },
    }),
);

jest.mock('../../../../../components/DataTableGravity', () => {
    type MockColumn = {id: string; cell: (context: unknown) => React.ReactNode};
    type MockCell = {
        id: string;
        column: {columnDef: {cell: (context: unknown) => React.ReactNode}};
        getContext: () => unknown;
    };
    type MockRow = {id: string; getVisibleCells: () => Array<MockCell>};
    return {
        __esModule: true,
        useTable: ({columns, data}: {columns: Array<MockColumn>; data: Array<unknown>}) => ({
            getRowModel: () => ({
                rows: data.map((original, rowIndex) => ({
                    id: String(rowIndex),
                    getVisibleCells: () =>
                        columns.map((column, columnIndex) => ({
                            id: `${rowIndex}:${columnIndex}`,
                            column: {columnDef: column},
                            getContext: () => ({row: {original}}),
                        })),
                })),
            }),
        }),
        TableCell: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
        DataTableGravity: ({table}: {table: {getRowModel: () => {rows: Array<MockRow>}}}) => (
            <div>
                {table.getRowModel().rows.map((row) => (
                    <div key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <span key={cell.id}>
                                {cell.column.columnDef.cell(cell.getContext())}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        ),
    };
});

jest.mock('./i18n', () => ({
    __esModule: true,
    default: (key: string) => key,
}));

import {FlowComputationMessages} from './FlowComputationMessages';

const staticSpec: FlowStaticSpec = {
    computations: {
        state: {
            group_by_schema: [
                {name: 'hash', type: 'uint64', expression: 'farm_hash(user_id)'},
                {name: 'user_id', type: 'uint64'},
                {name: 'event_id', type: 'string'},
            ],
        },
    },
};

const messages = [
    {level: 'info' as const, text: 'unrelated message'},
    {
        level: 'info' as const,
        text: 'Top 1 heavy hitters',
        yson: [
            'Key=[0#7147230554789414993u, 1#4506162232340681623u, 2#"17853020244229040161506001"], Ratio=0.306083, PartitionId=451c1f9-678607be-3b545a99-97dc719a',
        ],
    },
];

async function renderMessages() {
    await act(async () => {
        render(
            <FlowComputationMessages path="//pipeline" computation="state" messages={messages} />,
        );
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    mockUseStaticSpec.mockReturnValue({data: staticSpec});
});

it('links the heavy hitter key to the state tab seeded with the resolved key columns', async () => {
    await renderMessages();

    const keyText =
        '[0#7147230554789414993u, 1#4506162232340681623u, 2#"17853020244229040161506001"]';
    const href = screen.getByText(keyText).closest('a')?.getAttribute('href') ?? '';
    const seed = new URLSearchParams(href.split('?')[1]).get('heavyHitterSeed');

    expect(href).toContain('/hahn/flows/computations/state/state');
    expect(JSON.parse(seed ?? 'null')).toEqual({
        keyValues: {user_id: '4506162232340681623', event_id: '17853020244229040161506001'},
    });
});

it('links the partition id to the state tab seeded with that partition', async () => {
    await renderMessages();

    const href =
        screen.getByText('451c1f9-678607be-3b545a99-97dc719a').closest('a')?.getAttribute('href') ??
        '';
    const seed = new URLSearchParams(href.split('?')[1]).get('heavyHitterSeed');

    expect(JSON.parse(seed ?? 'null')).toEqual({
        partitionId: '451c1f9-678607be-3b545a99-97dc719a',
    });
    expect(screen.getByText('0.306083')).not.toBeNull();
});

it('hides the heavy hitters message from the raw message list', async () => {
    await renderMessages();

    expect(mockCollapsibleMessages).toHaveBeenLastCalledWith([messages[0]]);
});

it('renders the key as plain text when the static spec is unavailable', async () => {
    mockUseStaticSpec.mockReturnValue({data: undefined});
    await renderMessages();

    const keyText =
        '[0#7147230554789414993u, 1#4506162232340681623u, 2#"17853020244229040161506001"]';
    expect(screen.getByText(keyText).closest('a')).toBeNull();
});
