import type {RootState} from '../../reducers';
import {ytApiV4Id} from '../../../rum/rum-wrap-api';
import {
    SET_QUERY_PATCH,
    UPDATE_QUERY_ITEM,
} from '../../reducers/query-tracker/query-tracker-contants';
import {saveQueryAnnotations, setQueryName} from './queryAnnotations';

jest.mock('../../../rum/rum-wrap-api', () => ({
    YTApiId: {},
    ytApiV4Id: {getQuery: jest.fn(), alterQuery: jest.fn()},
}));
jest.mock('../../../common/yt-api', () => ({JSONSerializer: {}}));
jest.mock('./api', () => ({getQTApiSetup: () => ({proxy: 'test'})}));
jest.mock('./queriesList', () => ({updateQueryInList: () => ({type: 'update-list'})}));
jest.mock('../../selectors/query-tracker/query', () => ({
    selectQueryDraft: (state: RootState) => state.queryTracker.query.draft,
    selectQueryItem: (state: RootState) => state.queryTracker.query.queryItem,
    selectQueryTrackerRequestOptions: () => ({stage: 'test'}),
}));

function setup() {
    const query = {id: 'query', annotations: {title: 'A'}};
    const state = {
        queryTracker: {query: {draft: {...query}, queryItem: {...query}, sessionRevision: 1}},
    };
    const dispatch = jest.fn((action) => {
        if (action.type === SET_QUERY_PATCH)
            state.queryTracker.query.draft = {...state.queryTracker.query.draft, ...action.data};
        if (action.type === UPDATE_QUERY_ITEM) state.queryTracker.query.queryItem = action.data;
        return action;
    });
    const getState = () => state as unknown as RootState;
    const run = (action: ReturnType<typeof setQueryName>) => action(dispatch, getState, undefined);
    jest.mocked(ytApiV4Id.getQuery).mockResolvedValue(query);
    jest.mocked(ytApiV4Id.alterQuery).mockResolvedValue(undefined);
    return {state, run};
}

beforeEach(() => jest.clearAllMocks());

it('keeps a newer draft title when an earlier save resolves', async () => {
    const {state, run} = setup();
    let complete!: () => void;
    jest.mocked(ytApiV4Id.alterQuery).mockImplementationOnce(
        () =>
            new Promise<void>((resolve) => {
                complete = resolve;
            }),
    );
    const saving = run(setQueryName('query', 'A'));
    await new Promise(setImmediate);
    state.queryTracker.query.draft = {id: 'query', annotations: {title: 'B'}};
    complete();
    await saving;
    expect(state.queryTracker.query.draft.annotations.title).toBe('B');
    expect(state.queryTracker.query.queryItem.annotations.title).toBe('A');
});

it('merges a chart save without replacing a locally edited title', async () => {
    const {state, run} = setup();
    const saving = run(
        saveQueryAnnotations('query', (query) => ({
            ...query.annotations,
            dashboardChartsConfig: {version: 2, results: {}},
        })),
    );
    state.queryTracker.query.draft = {id: 'query', annotations: {title: 'B'}};
    await saving;
    expect(state.queryTracker.query.draft.annotations).toEqual({
        title: 'B',
        dashboardChartsConfig: {version: 2, results: {}},
    });
});

it('does not patch a reopened editor session', async () => {
    const {state, run} = setup();
    const saving = run(setQueryName('query', 'saved'));
    state.queryTracker.query.sessionRevision++;
    await saving;
    expect(state.queryTracker.query.draft.annotations.title).toBe('A');
});

it('updates an unchanged draft and continues the queue after rejection', async () => {
    const {state, run} = setup();
    jest.mocked(ytApiV4Id.alterQuery).mockRejectedValueOnce(new Error('failed'));
    const first = run(setQueryName('query', 'failed'));
    const second = run(setQueryName('query', 'saved'));
    await expect(first).rejects.toThrow('failed');
    await second;
    expect(state.queryTracker.query.draft.annotations.title).toBe('saved');
    expect(jest.mocked(ytApiV4Id.alterQuery)).toHaveBeenCalledTimes(2);
});

it('does not patch another query opened while saving', async () => {
    const {state, run} = setup();
    const saving = run(setQueryName('query', 'saved'));
    state.queryTracker.query.draft = {id: 'other', annotations: {title: 'other'}};
    await saving;
    expect(state.queryTracker.query.draft.annotations.title).toBe('other');
});

it('preserves a title cleared after the save was queued', async () => {
    const {state, run} = setup();
    const saving = run(setQueryName('query', 'saved'));
    state.queryTracker.query.draft = {id: 'query', annotations: {title: ''}};
    await saving;
    expect(state.queryTracker.query.draft.annotations.title).toBe('');
});
