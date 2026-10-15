import {query} from './query';
import {SET_QUERY, SET_QUERY_PATCH, UPDATE_QUERY_ITEM} from './query-tracker-contants';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryStatus} from '../../../types/query-tracker';
import type {QueryItem} from '../../../types/query-tracker/api';

const item = {
    id: 'query-id',
    engine: QueryEngine.YQL,
    query: 'SELECT 1',
    state: QueryStatus.RUNNING,
    annotations: {},
} as QueryItem;
describe('QueryPage workspace identity', () => {
    it('preserves identity and dirty text during polling', () => {
        const initial = query(undefined, {type: SET_QUERY, data: {initialQuery: item}});
        const edited = query(initial, {
            type: SET_QUERY_PATCH,
            data: {...initial.draft, query: 'SELECT 2'},
        });
        const polled = query(edited, {
            type: UPDATE_QUERY_ITEM,
            data: {...item, state: QueryStatus.COMPLETED},
        });
        expect(edited.sessionRevision).toBe(initial.sessionRevision);
        expect(polled.sessionRevision).toBe(initial.sessionRevision);
        expect(polled.draft.query).toBe('SELECT 2');
        expect(polled.dirtySinceLastSubmit).toBe(true);
    });
    it('starts a new workspace even for consecutive empty drafts', () => {
        const initial = query(undefined, {type: SET_QUERY, data: {}});
        const next = query(initial, {type: SET_QUERY, data: {}});
        expect(next.sessionRevision).toBe(initial.sessionRevision + 1);
        expect(next.queryItem).toBeUndefined();
        expect(next.dirtySinceLastSubmit).toBe(false);
    });
    it('keeps the editor when reloading the same execution after stopping', () => {
        const initial = query(undefined, {type: SET_QUERY, data: {initialQuery: item}});
        const next = query(initial, {
            type: SET_QUERY,
            data: {initialQuery: {...item, state: QueryStatus.ABORTED}},
        });
        expect(next.sessionRevision).toBe(initial.sessionRevision);
    });
    it('starts a new workspace when opening a query', () => {
        const initial = query(undefined, {type: SET_QUERY, data: {}});
        const next = query(initial, {type: SET_QUERY, data: {initialQuery: item}});
        expect(next.sessionRevision).toBe(initial.sessionRevision + 1);
        expect(next.draft.query).toBe(item.query);
    });
});
