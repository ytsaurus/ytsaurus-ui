/**
 * @jest-environment jsdom
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';

import type {FlowStateFiltersValue} from '../types';
import type {FlowStaticSpec} from '../../../../../../shared/yt-types';

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(global as unknown as {ResizeObserver: unknown}).ResizeObserver = ResizeObserverStub;

jest.mock('../../../../../i18n', () => ({
    __esModule: true,
    addI18Keysets: () => (key: string) => key,
}));

jest.mock('../../../../../components/Select/Select', () => ({
    __esModule: true,
    SelectSingle: () => null,
}));

jest.mock('../../../../../store/api/yt/flow', () => ({
    __esModule: true,
    useFlowExecuteQuery: () => ({data: undefined}),
}));

import {FlowStateFilters} from './FlowStateFilters';

const staticSpec: FlowStaticSpec = {
    computations: {
        comp1: {
            group_by_schema: [{name: 'hash', type: 'uint64', expression: 'farm_hash(user_id)'}],
        },
    },
};

const baseValue: FlowStateFiltersValue = {
    computationId: 'comp1',
    target: 'all',
    limit: 10,
    keyValues: {},
};

function renderFilters(onChange: (value: FlowStateFiltersValue) => void) {
    return render(
        <ThemeProvider theme="light">
            <FlowStateFilters
                pipeline_path="//pipeline"
                value={baseValue}
                onChange={onChange}
                onReset={jest.fn()}
                staticSpec={staticSpec}
            />
        </ThemeProvider>,
    );
}

function openTargetSelect() {
    fireEvent.click(screen.getByRole('combobox'));
}

describe('FlowStateFilters kind selector', () => {
    it('disables state kinds unavailable for the selected computation, with a hint title', () => {
        renderFilters(jest.fn());
        openTargetSelect();

        const disabledOption = screen.getByText('value_kind-internal-key');
        expect(disabledOption.closest('[role="option"]')?.getAttribute('aria-disabled')).toBe(
            'true',
        );
        expect(disabledOption.getAttribute('title')).toBe('hint_target-unavailable');

        const enabledOption = screen.getByText('value_kind-internal-partition');
        expect(enabledOption.closest('[role="option"]')?.getAttribute('aria-disabled')).toBe(
            'false',
        );
        expect(enabledOption.getAttribute('title')).toBeNull();
    });

    it('does not change the selection when a disabled option is clicked', () => {
        const onChange = jest.fn();
        renderFilters(onChange);
        openTargetSelect();

        fireEvent.click(screen.getByText('value_kind-internal-key'));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('updates the target and reconciles dependent fields when an available option is clicked', () => {
        const onChange = jest.fn();
        renderFilters(onChange);
        openTargetSelect();

        fireEvent.click(screen.getByText('value_kind-internal-partition'));

        expect(onChange).toHaveBeenCalledWith({
            ...baseValue,
            target: 'partition_state',
            keyValues: {},
        });
    });
});
