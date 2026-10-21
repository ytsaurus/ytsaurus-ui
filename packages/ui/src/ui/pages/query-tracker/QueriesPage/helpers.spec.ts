import {QueryEngine} from '../../../../shared/constants/engines';
import {ProgressStatuses, QueryStatus} from '../../../types/query-tracker';
import {getEditorActions, getQueryStatus, isRunDisabled} from './helpers';

describe('QueryPage editor actions', () => {
    const available = {canRun: true, loading: false, clusterLoading: false, submitting: false};
    it('allows a ready draft to run', () => expect(isRunDisabled(available)).toBe(false));
    it.each([{canRun: false}, {loading: true}, {clusterLoading: true}, {submitting: true}])(
        'blocks buttons and shortcuts when %j',
        (state) => {
            expect(isRunDisabled({...available, ...state})).toBe(true);
        },
    );
    it.each(Object.values(QueryEngine))('hides unsupported features for %s', (engine) => {
        const props = getEditorActions(engine, true, true);
        expect(props.hiddenPanels).toContain('parameters');
        expect(props.hiddenActions).toContain('format');
        expect(props.hiddenActions?.includes('validate')).toBe(engine !== QueryEngine.YQL);
        expect(props.actionStates?.run).toEqual({disabled: true, loading: true});
        expect(props.actionStates?.validate).toEqual(props.actionStates?.run);
        expect(props).not.toHaveProperty('saveProps');
        expect(props).not.toHaveProperty('shareProps');
    });
});

describe('working query status', () => {
    it('shows an empty draft', () => expect(getQueryStatus()).toBe('draft'));
    it.each(ProgressStatuses)('shows %s as running', (state) => {
        expect(getQueryStatus(state)).toBe('running');
    });
    it.each([
        [QueryStatus.COMPLETED, 'completed'],
        [QueryStatus.ABORTED, 'aborted'],
        [QueryStatus.FAILED, 'failed'],
        [QueryStatus.DRAFT, 'draft'],
    ] as const)('maps %s', (state, expected) => expect(getQueryStatus(state)).toBe(expected));
});
