import {
    getAvailableStateTargets,
    getStateNameInputMode,
    getStateNameSelectItems,
    reconcileStateName,
    reconcileStateTarget,
    seedStateFilters,
} from './state-filter-options';
import type {FlowStaticSpec} from '../../../../../shared/yt-types';
import {joinedSpec} from './state-test-fixtures';

describe('getAvailableStateTargets', () => {
    it('leaves every target available without a chosen computation', () => {
        expect(getAvailableStateTargets(joinedSpec, undefined)).toEqual({
            all: true,
            key_state: true,
            partition_state: true,
            external_key_state: true,
        });
    });
    it('marks every kind available for a computation declaring all of them', () => {
        expect(getAvailableStateTargets(joinedSpec, 'state')).toEqual({
            all: true,
            key_state: true,
            partition_state: true,
            external_key_state: true,
        });
    });
    it('disables kinds the computation does not declare', () => {
        const bareSpec: FlowStaticSpec = {computations: {state: {}}};
        expect(getAvailableStateTargets(bareSpec, 'state')).toEqual({
            all: true,
            key_state: false,
            partition_state: false,
            external_key_state: false,
        });
    });
});
describe('reconcileStateTarget', () => {
    it('keeps the target when the new computation still declares it', () => {
        expect(reconcileStateTarget(joinedSpec, 'state', 'external_key_state')).toBe(
            'external_key_state',
        );
    });
    it('falls back to all when the new computation no longer declares the target', () => {
        const bareSpec: FlowStaticSpec = {computations: {state: {}}};
        expect(reconcileStateTarget(bareSpec, 'state', 'external_key_state')).toBe('all');
    });
    it('leaves all untouched regardless of the computation', () => {
        const bareSpec: FlowStaticSpec = {computations: {state: {}}};
        expect(reconcileStateTarget(bareSpec, 'state', 'all')).toBe('all');
    });
});

describe('getStateNameInputMode', () => {
    it('constrains the name to declared managers only for external_key_state', () => {
        expect(getStateNameInputMode('external_key_state')).toBe('declared-only');
    });
    it('suggests known names under the all target', () => {
        expect(getStateNameInputMode('all')).toBe('suggested');
    });
    it.each(['key_state', 'partition_state'] as const)(
        'takes a free-form name for the %s target',
        (target) => {
            expect(getStateNameInputMode(target)).toBe('free-form');
        },
    );
});

describe('reconcileStateName', () => {
    it('drops a free-form name that external_key_state cannot address', () => {
        expect(reconcileStateName('/key_state', 'external_key_state', ['/ext'])).toBeUndefined();
    });
    it('keeps a declared manager name under external_key_state', () => {
        expect(reconcileStateName('/ext', 'external_key_state', ['/ext'])).toBe('/ext');
    });
    it('keeps a free-form name when the target still accepts one', () => {
        expect(reconcileStateName('/anything', 'key_state', [])).toBe('/anything');
    });
    it('keeps a joiner name under the all target that reaches the joined section', () => {
        expect(reconcileStateName('/joined', 'all', ['/state', '/joined'])).toBe('/joined');
    });
    it('drops a joiner-only name when entering the strict external target', () => {
        expect(reconcileStateName('/joined', 'external_key_state', ['/state'])).toBeUndefined();
    });
});

describe('getStateNameSelectItems', () => {
    it('appends the active name so the select always displays it', () => {
        expect(getStateNameSelectItems(['/a'], '/typed')).toEqual(['/a', '/typed']);
    });
    it('does not duplicate a known name', () => {
        expect(getStateNameSelectItems(['/a'], '/a')).toEqual(['/a']);
    });
    it('returns the known names without a current value', () => {
        expect(getStateNameSelectItems(['/a'], undefined)).toEqual(['/a']);
    });
});

describe('seedStateFilters', () => {
    it('prefers the fixed computation over the initial one', () => {
        expect(seedStateFilters('fixed', {computationId: 'initial'}).computationId).toBe('fixed');
    });
    it('falls back to the initial computation when none is fixed', () => {
        expect(seedStateFilters(undefined, {computationId: 'initial'}).computationId).toBe(
            'initial',
        );
    });
});
