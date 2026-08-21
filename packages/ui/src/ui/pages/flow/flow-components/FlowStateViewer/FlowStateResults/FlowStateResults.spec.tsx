/** @jest-environment jsdom */
import React from 'react';
import {render, screen} from '@testing-library/react';

import type {FlowStateCellHandlers} from '../types';
import type {FlowReadStatesResponse} from '../../../../../../shared/yt-types';

jest.mock('@ytsaurus/components', () => ({ClipboardButton: () => null, setLang: () => {}}));

jest.mock('../../../../../components/NoContent', () => ({
    NoContent: () => <div data-testid="no-content" />,
}));

jest.mock('../../../../../components/AttributesButton/ClickableAttributesButton', () => () => null);
jest.mock('../../../../../components/ClickableText/ClickableText', () => ({
    ClickableText: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
}));
jest.mock('../../../../../components/Yson/Yson', () => ({
    Yson: () => null,
}));
jest.mock('../../../../../components/Yson/YsonWithScroll', () => ({
    YsonWithScroll: () => null,
}));
jest.mock('../../../../../containers/RoutedLink/RoutedLink', () => ({
    RoutedLink: ({children}: {children: React.ReactNode}) => <a>{children}</a>,
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
    DataTableGravity: () => <div data-testid="results-table" />,
    TableCell: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    selectionColumn: {},
    useTable: () => ({}),
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
    isRowFilterActive: () => false,
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
            onDeleteSelected={() => {}}
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
    expect(screen.queryByTestId('no-content')).toBeNull();
});

it('keeps stale populated results visible while refreshing', () => {
    const response: FlowReadStatesResponse = {
        partition_states: [
            {computation_id: 'state', partition_id: 'partition', states: {'/state': 1}},
        ],
    };
    renderResults({response, refreshing: true});
    expect(screen.getByTestId('results-table')).not.toBeNull();
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
