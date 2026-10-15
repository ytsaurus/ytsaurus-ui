import type {QueryTab} from '../../../../store/reducers/query-tracker/queryTabsSlice';
import {getActiveExecutionTab} from './helpers';

const tabs: QueryTab[] = [
    {id: 'result/0', title: 'Result'},
    {id: 'error', title: 'Error'},
];
describe('execution selection', () => {
    it('does not expose previous results in a new draft', () => {
        expect(getActiveExecutionTab(undefined, tabs, 'result/0')).toBe('');
    });
    it('keeps the selected error instead of returning to results on polling', () => {
        expect(getActiveExecutionTab('query-id', tabs, 'error')).toBe('error');
    });
    it('recovers when a previously selected result disappears', () => {
        expect(getActiveExecutionTab('query-id', tabs, 'result/4')).toBe('result/0');
    });
    it('keeps an empty execution controlled', () => {
        expect(getActiveExecutionTab('query-id', [], 'result/0')).toBe('');
    });
});
