import type {RootState} from '../../reducers';
import type {QueryResult as RawResult} from '../../../types/query-tracker/api';
import {QueryResultState} from '../../../types/query-tracker/queryResult';
import {
    type QueryResultsActions,
    type QueryResultsState,
    queryResult,
} from '../../reducers/query-tracker/queryResult';
import {getQueryResultMeta, readQueryResults} from './api';
import {loadNextQueryResult, loadQueryResult, updateQueryResult} from './queryResult';

jest.mock('./api', () => ({getQueryResultMeta: jest.fn(), readQueryResults: jest.fn()}));
jest.mock('../../reducers/settings', () => ({
    getSettingsInitialData: () => ({'global::navigation::rowsPerTablePage': 100}),
}));
jest.mock('@ytsaurus/components', () => ({
    parseV3Type: () => [],
    getSchemaDateType: () => ({name: 'Int64'}),
}));
jest.mock('../../selectors/global', () => ({}));
jest.mock('../../selectors/global/supported-features', () => ({
    selectPrimitiveTypesMap: () => new Set(),
}));
jest.mock('../../../utils/queries/format', () => ({
    prepareFormattedValue: (value: unknown) => ({$value: value}),
}));
jest.mock('../../../utils/utils', () => ({wrapApiPromiseByToaster: (promise: unknown) => promise}));
jest.mock('../../../common/thor/ypath', () => ({
    getValue: (value: {$value: unknown}) => value.$value,
}));
jest.mock('../global/fonts', () => ({waitForFontFamilies: () => Promise.resolve()}));
jest.mock('../../../rum/rum-wrap-api', () => ({}));
jest.mock('../../../pages/query-tracker/QueryEditor/QueryExecutionView/i18n', () => () => 'error');

function raw(start: number, count: number): RawResult {
    return {
        rows: Array.from({length: count}, (_, i) => ({value: [String(start + i), '0']})),
        yql_type_registry: [['DataType', 'Int64']],
        all_column_names: ['value'],
        incomplete_all_column_names: false,
        incomplete_columns: false,
    };
}
function setup() {
    let results: QueryResultsState = {};
    const getState = () => ({queryTracker: {results}}) as unknown as RootState;
    const dispatch = (action: unknown): unknown => {
        if (typeof action === 'function') return action(dispatch, getState);
        if (action && typeof action === 'object' && 'type' in action)
            results = queryResult(results, action as QueryResultsActions);
        return action;
    };
    const run = (action: ReturnType<typeof loadQueryResult>) =>
        action(dispatch, getState, undefined);
    jest.mocked(getQueryResultMeta).mockImplementation(
        () =>
            (() =>
                Promise.resolve({
                    schema: {$value: [{name: 'value', type_v3: 'int64'}]},
                    data_statistics: {row_count: 300},
                })) as unknown as ReturnType<typeof getQueryResultMeta>,
    );
    jest.mocked(readQueryResults).mockImplementation(
        ({cursor}) =>
            (() => Promise.resolve(raw(cursor?.start || 0, 100))) as ReturnType<
                typeof readQueryResults
            >,
    );
    return {run, result: () => results.query?.[0]};
}
beforeEach(() => jest.clearAllMocks());

it('normalizes a legacy page before appending, preserving settings', async () => {
    const {run, result} = setup();
    await run(loadQueryResult('query'));
    await run(updateQueryResult('query', 0, 1));
    expect(result()).toMatchObject({rowOffset: 100, page: 1});
    const settings = result()?.settings;
    await run(loadNextQueryResult('query', 0));
    expect(result()).toMatchObject({rowOffset: 100});
    await run(loadQueryResult('query', 0, {fromStart: true}));
    await run(loadNextQueryResult('query', 0));
    const current = result();
    expect(current?.settings).toEqual(settings);
    expect(current?.resultReady && current.rawResult?.rows.map((row) => row.value[0])).toEqual(
        Array.from({length: 200}, (_, i) => String(i)),
    );
    await run(updateQueryResult('query', 0, 2));
    expect(result()).toMatchObject({rowOffset: 200, page: 2});
});

it('ignores a late legacy page response after normalization', async () => {
    const {run, result} = setup();
    await run(loadQueryResult('query'));
    let complete!: (value: RawResult) => void;
    jest.mocked(readQueryResults).mockImplementationOnce(
        () =>
            (() =>
                new Promise<RawResult>((resolve) => {
                    complete = resolve;
                })) as ReturnType<typeof readQueryResults>,
    );
    const legacy = run(updateQueryResult('query', 0, 1));
    await new Promise(setImmediate);
    await run(loadQueryResult('query', 0, {fromStart: true}));
    complete(raw(100, 100));
    await legacy;
    expect(result()).toMatchObject({rowOffset: 0, page: 0, state: QueryResultState.Ready});
});

it('deduplicates pending loads and allows retry after normalization failure', async () => {
    const {run, result} = setup();
    await run(loadQueryResult('query'));
    await run(updateQueryResult('query', 0, 1));
    jest.mocked(readQueryResults).mockImplementationOnce(
        () => (() => Promise.reject(new Error('failed'))) as ReturnType<typeof readQueryResults>,
    );
    const before = jest.mocked(readQueryResults).mock.calls.length;
    await Promise.all([
        run(loadQueryResult('query', 0, {fromStart: true})),
        run(loadQueryResult('query', 0, {fromStart: true})),
    ]);
    expect(jest.mocked(readQueryResults).mock.calls).toHaveLength(before + 1);
    expect(result()?.state).toBe(QueryResultState.Error);
    await run(loadQueryResult('query', 0, {fromStart: true}));
    expect(result()).toMatchObject({rowOffset: 0, state: QueryResultState.Ready});
});

it('deduplicates load-more requests and preserves rows after a failed append', async () => {
    const {run, result} = setup();
    await run(loadQueryResult('query'));
    let fail!: (error: Error) => void;
    jest.mocked(readQueryResults).mockImplementationOnce(
        () =>
            (() =>
                new Promise<RawResult>((_resolve, reject) => {
                    fail = reject;
                })) as ReturnType<typeof readQueryResults>,
    );
    const before = jest.mocked(readQueryResults).mock.calls.length;
    const loading = run(loadNextQueryResult('query', 0));
    await run(loadNextQueryResult('query', 0));
    expect(jest.mocked(readQueryResults).mock.calls).toHaveLength(before + 1);
    fail(new Error('failed'));
    await loading;
    expect(result()).toMatchObject({state: QueryResultState.Ready, rowOffset: 0});
    await run(loadNextQueryResult('query', 0));
    const current = result();
    expect(current?.resultReady && current.results).toHaveLength(200);
});

it('finishes loading an empty legacy page', async () => {
    const {run, result} = setup();
    await run(loadQueryResult('query'));
    jest.mocked(readQueryResults).mockImplementationOnce(
        () => (() => Promise.resolve(raw(300, 0))) as ReturnType<typeof readQueryResults>,
    );
    await run(updateQueryResult('query', 0, 3));
    expect(result()).toMatchObject({state: QueryResultState.Ready, rowOffset: 300, results: []});
});
