import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import * as types from '../../../../constants/components/versions/versions';
import mockStore from '../../../../store/__mocks__';
import {
    changeAddressFilter,
    changeTypeFilter,
    changeVersionFilter,
    loadVersions,
    sortDetailedTable,
    sortSummaryTable,
} from '../../../../store/actions/components/versions/versions';

jest.mock('yt', () => ({
    v3: {
        _discoverVersions: jest.fn().mockImplementation(() => Promise.resolve('correct versions')),
    },
}));

const versionFilter = {text: 'Version', value: 'version', count: 0};
const typeFilter = {text: 'Type', value: 'type', count: 0};
const detailedSortState = {field: 'detailed', asc: true};
const summarySortState = {field: 'summary', asc: true};
const textValue = 'textValue';
const newFilter = 'total';
const error = 'error message';

const Action = {
    REQUEST: {type: types.DISCOVER_VERSIONS.REQUEST},
    SUCCESS: {
        type: types.DISCOVER_VERSIONS.SUCCESS,
        data: {
            versions: 'correct versions',
            detailedSortState,
            summarySortState,
        },
    },
    FAILURE: {
        type: types.DISCOVER_VERSIONS.FAILURE,
        data: {error},
    },
    CANCELLED: {type: types.DISCOVER_VERSIONS.CANCELLED},
    SORT_SUMMARY: {
        type: types.SORT_SUMMARY_TABLE,
        data: {sortState: summarySortState},
    },
    SORT_DETAILED: {
        type: types.SORT_DETAILED_TABLE,
        data: {sortState: detailedSortState},
    },
    CHANGE_ADDRESS_FILTER: {
        type: types.CHANGE_ADDRESS_FILTER,
        data: {newFilter: textValue, sortState: detailedSortState},
    },
    CHANGE_VERSION_FILTER: {
        type: types.CHANGE_VERSION_FILTER,
        data: {newFilter, sortState: detailedSortState},
    },
    CHANGE_TYPE_FILTER: {
        type: types.CHANGE_TYPE_FILTER,
        data: {newFilter, sortState: detailedSortState},
    },
};

describe('actions/components/versions', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            tables: {
                [types.COMPONENTS_VERSIONS_DETAILED_TABLE_ID]: detailedSortState,
                [types.COMPONENTS_VERSIONS_SUMMARY_TABLE_ID]: summarySortState,
            },
            components: {
                versions: {
                    activeVersionFilter: versionFilter,
                    activeTypeFilter: typeFilter,
                    loaded: false,
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loadVersions', () => {
        it('should return function from action creator', () => {
            expect(loadVersions()).toBeFunction();
        });

        it(`should dispatch ${types.DISCOVER_VERSIONS.REQUEST}`, () => {
            store.dispatch(loadVersions());

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.REQUEST);
        });

        it(`should dispatch ${types.DISCOVER_VERSIONS.SUCCESS}`, async () => {
            await store.dispatch(loadVersions());

            expect(store.getActions()).toContainEqual(Action.SUCCESS);
        });

        it(`should dispatch ${types.DISCOVER_VERSIONS.FAILURE}`, async () => {
            yt.v3._discoverVersions.mockImplementation(() => Promise.reject(error));
            await store.dispatch(loadVersions());

            expect(store.getActions()).toContainEqual(Action.FAILURE);
        });
    });

    describe('sortSummaryTable', () => {
        it('should return function from action creator', () => {
            expect(sortSummaryTable()).toBeFunction();
        });

        it(`should dispatch ${types.SORT_SUMMARY_TABLE}`, () => {
            store.dispatch(sortSummaryTable());

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.SORT_SUMMARY);
        });
    });

    describe('sortDetailedTable', () => {
        it('should return function from action creator', () => {
            expect(sortDetailedTable()).toBeFunction();
        });

        it(`should dispatch ${types.SORT_DETAILED_TABLE}`, () => {
            store.dispatch(sortDetailedTable());

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.SORT_DETAILED);
        });
    });

    describe('changeAddressFilter', () => {
        it('should return function from action creator', () => {
            expect(changeAddressFilter()).toBeFunction();
        });

        it(`should dispatch ${types.CHANGE_ADDRESS_FILTER}`, () => {
            store.dispatch(changeAddressFilter(textValue));

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.CHANGE_ADDRESS_FILTER);
        });
    });

    describe('changeVersionFilter', () => {
        it('should return function from action creator', () => {
            expect(changeVersionFilter(newFilter)).toBeFunction();
        });

        it(`should dispatch ${types.CHANGE_VERSION_FILTER}`, () => {
            store.dispatch(changeVersionFilter(newFilter));

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.CHANGE_VERSION_FILTER);
        });

        it('should avoid dispatching the new filter if old filter === new filter', () => {
            store.dispatch(changeVersionFilter('version'));

            const actions = store.getActions();

            expect(actions).not.toContainEqual(Action.CHANGE_VERSION_FILTER);
        });
    });

    describe('changeTypeFilter', () => {
        it('should return function from action creator', () => {
            expect(changeTypeFilter(newFilter)).toBeFunction();
        });

        it(`should dispatch ${types.CHANGE_TYPE_FILTER}`, () => {
            store.dispatch(changeTypeFilter(newFilter));

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.CHANGE_TYPE_FILTER);
        });

        it('should avoid dispatching the new filter if old filter === new filter', () => {
            store.dispatch(changeTypeFilter(['type']));

            const actions = store.getActions();

            expect(actions).not.toContainEqual(Action.CHANGE_TYPE_FILTER);
        });
    });
});
