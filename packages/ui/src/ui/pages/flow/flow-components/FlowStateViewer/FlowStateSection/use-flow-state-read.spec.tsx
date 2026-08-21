/** @jest-environment jsdom */
import {act, renderHook} from '@testing-library/react';

import type {FlowStaticSpec} from '../../../../../../shared/yt-types';

const mockUseStaticSpec = jest.fn();
const mockUseReadStates = jest.fn();

jest.mock('../../../../../store/api/yt/flow', () => ({
    useFlowStaticSpecQuery: (...args: Array<unknown>) => mockUseStaticSpec(...args),
    useFlowReadStatesQuery: (...args: Array<unknown>) => mockUseReadStates(...args),
}));

jest.mock('./i18n', () => ({
    __esModule: true,
    default: (key: string) => key,
}));

import {AUTO_LOAD_DEBOUNCE_MS} from '../state-requests';
import {useFlowStateRead} from './use-flow-state-read';

const staticSpec: FlowStaticSpec = {
    computations: {first: {}, second: {}},
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseStaticSpec.mockReturnValue({data: undefined});
    mockUseReadStates.mockReturnValue({
        data: undefined,
        error: undefined,
        isFetching: false,
        isSuccess: false,
        refetch: jest.fn(),
    });
});

afterEach(() => {
    jest.useRealTimers();
});

it('selects the first computation once when describe data arrives', () => {
    const {result, rerender} = renderHook(() => useFlowStateRead({pipeline_path: '//pipeline'}));

    mockUseStaticSpec.mockReturnValue({data: staticSpec});
    rerender();

    expect(result.current.filters.computationId).toBe('first');
});

it.each([
    ['fixed computation', {fixedComputationId: 'fixed'}, 'fixed', undefined],
    ['initial computation', {initialFilters: {computationId: 'initial'}}, 'initial', undefined],
    ['initial partition', {initialFilters: {partitionId: 'partition'}}, undefined, 'partition'],
] as const)(
    'preserves %s when describe data arrives',
    (_name, options, computationId, partitionId) => {
        const {result, rerender} = renderHook(() =>
            useFlowStateRead({pipeline_path: '//pipeline', ...options}),
        );

        mockUseStaticSpec.mockReturnValue({data: staticSpec});
        rerender();

        expect(result.current.filters.computationId).toBe(computationId);
        expect(result.current.filters.partitionId).toBe(partitionId);
    },
);

it('does not override a value-form user selection made before describe resolves', () => {
    const {result, rerender} = renderHook(() => useFlowStateRead({pipeline_path: '//pipeline'}));

    act(() => result.current.setFilters({...result.current.filters, computationId: 'second'}));
    mockUseStaticSpec.mockReturnValue({data: staticSpec});
    rerender();

    expect(result.current.filters.computationId).toBe('second');
});

it('does not reselect after an updater-form explicit clear', () => {
    mockUseStaticSpec.mockReturnValue({data: staticSpec});
    const {result, rerender} = renderHook(() => useFlowStateRead({pipeline_path: '//pipeline'}));

    expect(result.current.filters.computationId).toBe('first');
    act(() => result.current.setFilters((current) => ({...current, computationId: undefined})));
    rerender();

    expect(result.current.filters.computationId).toBeUndefined();
});

it('always sends the fixed read bound', () => {
    renderHook(() => useFlowStateRead({pipeline_path: '//pipeline', fixedComputationId: 'fixed'}));

    expect(mockUseReadStates).toHaveBeenLastCalledWith({
        parameters: {pipeline_path: '//pipeline'},
        body: {computation_id: 'fixed', limit: 10},
    });
});

it('treats a pending debounce as refreshing retained data', () => {
    mockUseReadStates.mockReturnValue({
        data: {partition_states: []},
        error: undefined,
        isFetching: false,
        isSuccess: true,
        refetch: jest.fn(),
    });
    const {result} = renderHook(() =>
        useFlowStateRead({pipeline_path: '//pipeline', fixedComputationId: 'fixed'}),
    );

    act(() => result.current.setFilters((current) => ({...current, stateName: '/next'})));

    expect(result.current.debouncePending).toBe(true);
    expect(result.current.refreshing).toBe(true);
    expect(result.current.readSucceeded).toBe(false);

    act(() => jest.advanceTimersByTime(AUTO_LOAD_DEBOUNCE_MS));

    expect(result.current.debouncePending).toBe(false);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.readSucceeded).toBe(true);
});
