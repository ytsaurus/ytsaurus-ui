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

window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;

jest.mock('../../../../../i18n', () => ({
    __esModule: true,
    addI18Keysets: () => (key: string) => key,
}));

jest.mock('../../../../../components/Select/Select', () => ({
    __esModule: true,
    SelectSingle: ({
        label,
        disabled,
        items = [],
        onChange,
    }: {
        label: string;
        disabled?: boolean;
        items?: Array<{value: string}>;
        onChange?: (value?: string) => void;
    }) => (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            data-items={items.map(({value}) => value).join(',')}
            onClick={() => onChange?.(items[0]?.value)}
        />
    ),
}));

jest.mock('../../../../../containers/Dialog', () => ({
    YTDFDialog: () => null,
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
    keyValues: {},
};

function renderFilters(
    onChange: (value: FlowStateFiltersValue) => void,
    props: Partial<React.ComponentProps<typeof FlowStateFilters>> = {},
) {
    return render(
        <ThemeProvider theme="light">
            <FlowStateFilters
                pipeline_path="//pipeline"
                value={baseValue}
                onChange={onChange}
                onReset={jest.fn()}
                staticSpec={staticSpec}
                {...props}
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

describe('FlowStateFilters narrowing controls', () => {
    it('keeps scope controls on the first row and key plus utilities on the second row', () => {
        renderFilters(jest.fn(), {
            staticSpec: {
                computations: {
                    comp1: {group_by_schema: [{name: 'user_id', type: 'uint64'}]},
                },
            },
            actions: (
                <React.Fragment>
                    <button aria-label="show-raw" />
                    <button aria-label="bounded-info" />
                </React.Fragment>
            ),
        });

        const primaryControls = [
            screen.getByRole('button', {name: 'field_computation'}),
            screen.getByRole('combobox', {name: 'field_state-kind'}),
            screen.getByRole('button', {name: 'field_state-name'}),
            screen.getByRole('button', {name: 'field_partition'}),
        ];
        const secondaryControls = [
            screen.getByRole('textbox', {name: 'field_raw-key'}),
            screen.getByRole('button', {name: 'action_reset-filters'}),
            screen.getByRole('button', {name: 'show-raw'}),
            screen.getByRole('button', {name: 'bounded-info'}),
        ];
        const primaryRow = document.querySelector('.yt-flow-state-filters__row_primary');
        const secondaryRow = document.querySelector('.yt-flow-state-filters__row_secondary');

        expect(primaryRow).not.toBeNull();
        expect(secondaryRow).not.toBeNull();
        expect(primaryControls.every((control) => primaryRow?.contains(control))).toBe(true);
        expect(secondaryControls.every((control) => secondaryRow?.contains(control))).toBe(true);
        expect(primaryRow?.contains(secondaryControls[0])).toBe(false);
    });

    it('renders a raw Key filter for runtime keys without a declared schema', () => {
        renderFilters(jest.fn(), {rawKeyAvailable: true});

        expect(screen.getByRole('textbox', {name: 'field_raw-key'})).not.toBeNull();
        expect(screen.queryByRole('button', {name: 'action_edit-key-fields'})).toBeNull();
    });

    it('does not render a Limit control', () => {
        renderFilters(jest.fn());
        expect(screen.queryByText('field_limit')).toBeNull();
    });

    it('disables Target and State until a computation or partition is selected', () => {
        const onChange = jest.fn();
        renderFilters(onChange, {value: {...baseValue, computationId: undefined}});

        expect((screen.getByRole('combobox') as HTMLButtonElement).disabled).toBe(true);
        expect(
            (screen.getByRole('button', {name: 'field_state-name'}) as HTMLButtonElement).disabled,
        ).toBe(true);
        fireEvent.click(screen.getByRole('combobox'));
        fireEvent.click(screen.getByRole('button', {name: 'field_state-name'}));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('disables a declared-only State selector with no items', () => {
        renderFilters(jest.fn(), {
            value: {...baseValue, target: 'external_key_state'},
        });

        const state = screen.getByRole('button', {name: 'field_state-name'});
        expect((state as HTMLButtonElement).disabled).toBe(true);
        expect(state.getAttribute('data-items')).toBe('');
    });

    it('keeps Reset enabled and delegates restoring the seed', () => {
        const onReset = jest.fn();
        renderFilters(jest.fn(), {onReset});

        const reset = screen.getByRole('button', {name: 'action_reset-filters'});
        expect((reset as HTMLButtonElement).disabled).toBe(false);
        fireEvent.click(reset);
        expect(onReset).toHaveBeenCalledTimes(1);
    });
});
