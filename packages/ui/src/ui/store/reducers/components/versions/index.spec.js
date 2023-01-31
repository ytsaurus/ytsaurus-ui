import reducer, {initialState} from './index';
import * as types from '../../../../constants/components/versions/versions';
import {
    sortSummary,
    sortDetailed,
    getActualData,
    aggregateDetailed,
    getActiveFilter,
    getFilterColumns,
} from '../../../../utils/components/versions/index';

jest.mock('../../../../utils/components/versions', () => ({
    prepareVersions: jest.fn(),
    aggregateSummary: jest.fn(),
    aggregateDetailed: jest.fn(),
    sortDetailed: jest.fn(),
    sortSummary: jest.fn(),
    getActualData: jest.fn(),
    getActiveFilter: jest.fn(),
    getFilterColumns: jest.fn(),
}));

const detailedSortState = {field: 'version', asc: true};
const summarySortState = {field: 'version', asc: true};

const initialVersions = [
    {text: 'All', value: 'total', count: 9},
    {text: '19.3.26', value: '19.3.26', count: 6},
    {text: '19.4.26', value: '19.4.26', count: 3},
];

const initialTypes = [
    {text: 'All', value: 'total', count: 9},
    {text: 'HTTP proxy', value: 'http_proxy', count: 3},
    {text: 'Node', value: 'node', count: 3},
    {text: 'Primary master', value: 'primary_master', count: 3},
];

const summary = [
    {http_proxies: 3, nodes: 3, primary_masters: 3, version: 'total'},
    {http_proxies: 2, nodes: 2, primary_masters: 2, version: '19.3.26'},
    {http_proxies: 1, nodes: 1, primary_masters: 1, version: '19.4.26'},
];

const detailed = [
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'sas01',
        type: 'primary_master',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'man01',
        type: 'primary_master',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'vla01',
        type: 'primary_master',
    },
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'n0010',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0012',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0009',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'n0010',
        type: 'http_proxy',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0009',
        type: 'http_proxy',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0007',
        type: 'http_proxy',
    },
];

const addressFilter = 'n0010';
const filteredByAddressDetailed = [
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0010',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0010',
        type: 'http_proxy',
    },
];
const filteredByAddressTypes = [
    {text: 'All', value: 'total', count: 2},
    {text: 'HTTP proxy', value: 'http_proxy', count: 1},
    {text: 'Node', value: 'node', count: 1},
    {text: 'Primary master', value: 'primary_master', count: 0},
];
const filteredByAddressVersions = [
    {text: 'All', value: 'total', count: 2},
    {text: '19.3.26', value: '19.3.26', count: 2},
    {text: '19.4.26', value: '19.4.26', count: 0},
];

const activeVersionFilter = {text: '19.4.26', value: '19.4.26', count: 3};
const filteredByVersionDetailed = [
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'sas01',
        type: 'primary_master',
    },
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'n0010',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'n0010',
        type: 'http_proxy',
    },
];
const filteredByVersionTypes = [
    {text: 'All', value: 'total', count: 3},
    {text: 'HTTP proxy', value: 'http_proxy', count: 1},
    {text: 'Node', value: 'node', count: 1},
    {text: 'Primary master', value: 'primary_master', count: 1},
];

const activeTypeFilter = {text: 'Node', value: 'node', count: 3};
const filteredByTypeDetailed = [
    {
        start_time: 'start time',
        version: '19.4.26',
        address: 'n0010',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0012',
        type: 'node',
    },
    {
        start_time: 'start time',
        version: '19.3.26',
        address: 'n0009',
        type: 'node',
    },
];
const filteredByTypeVersions = [
    {text: 'All', value: 'total', count: 3},
    {text: '19.3.26', value: '19.3.26', count: 2},
    {text: '19.4.26', value: '19.4.26', count: 1},
];

const versions = {summary, detailed};
const activeFilter = {value: 'value', text: 'Text', count: 0};

describe('reducers/components/versions', () => {
    getActualData.mockImplementation(() => ({
        actualVersions: initialVersions,
        actualTypes: initialTypes,
        filteredDetailed: detailed,
    }));
    sortSummary.mockImplementation(() => summary);
    aggregateDetailed.mockImplementation(() => detailed);
    getActiveFilter.mockImplementation(() => activeFilter);
    getFilterColumns.mockImplementation((data, type) =>
        type === 'version' ? initialVersions : initialTypes,
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return the initial state', () => {
        expect(reducer(undefined, {type: '@@INIT'})).toEqual(initialState);
    });

    it(`should handle ${types.DISCOVER_VERSIONS.REQUEST}`, () => {
        const action = {type: types.DISCOVER_VERSIONS.REQUEST};
        const result = {...initialState, loading: true};

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.DISCOVER_VERSIONS.SUCCESS}`, () => {
        const action = {
            type: types.DISCOVER_VERSIONS.SUCCESS,
            data: {detailedSortState, summarySortState, versions},
        };

        const result = {
            ...initialState,
            summary,
            detailed,
            activeTypeFilter: activeFilter,
            activeVersionFilter: activeFilter,
            filteredDetailed: detailed,
            actualVersions: initialVersions,
            actualTypes: initialTypes,
            allVersions: initialVersions,
            allTypes: initialTypes,
            loading: false,
            loaded: true,
            error: false,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.DISCOVER_VERSIONS.FAILURE}`, () => {
        const error = 'error';

        const action = {
            type: types.DISCOVER_VERSIONS.FAILURE,
            data: {error},
        };
        const result = {
            ...initialState,
            loading: false,
            error: true,
            errorData: error,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.SORT_SUMMARY_TABLE}`, () => {
        const action = {
            type: types.SORT_SUMMARY_TABLE,
            data: {sortState: summarySortState},
        };
        const sortedSummary = sortSummary(summary, summarySortState);
        const result = {...initialState, summary: sortedSummary};

        expect(reducer({...initialState, summary}, action)).toEqual(result);
    });

    it(`should handle ${types.SORT_DETAILED_TABLE}`, () => {
        const action = {
            type: types.SORT_DETAILED_TABLE,
            data: {sortState: detailedSortState},
        };
        const sortedDetailed = sortDetailed(detailed, detailedSortState);

        const state = {...initialState, filteredDetailed: detailed};
        const result = {...initialState, filteredDetailed: sortedDetailed};

        expect(reducer(state, action)).toEqual(result);
    });

    it(`should handle ${types.CHANGE_ADDRESS_FILTER}`, () => {
        const actualVersions = filteredByAddressVersions;
        const actualTypes = filteredByAddressTypes;
        const filteredDetailed = filteredByAddressDetailed;

        getActualData.mockImplementation(() => ({
            actualVersions,
            actualTypes,
            filteredDetailed,
        }));

        const action = {
            type: types.CHANGE_ADDRESS_FILTER,
            data: {sortState: detailedSortState, newFilter: addressFilter},
        };
        const result = {
            ...initialState,
            actualVersions,
            actualTypes,
            filteredDetailed,
            activeAddressFilter: addressFilter,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.CHANGE_VERSION_FILTER}`, () => {
        const actualVersions = initialVersions;
        const actualTypes = filteredByVersionTypes;
        const filteredDetailed = filteredByVersionDetailed;

        getActualData.mockImplementation(() => ({
            actualVersions,
            actualTypes,
            filteredDetailed,
        }));

        const action = {
            type: types.CHANGE_VERSION_FILTER,
            data: {
                sortState: detailedSortState,
                newFilter: activeVersionFilter.value,
            },
        };
        const state = {
            ...initialState,
            allVersions: initialVersions,
            allTypes: initialTypes,
            actualTypes: initialTypes,
            actualVersions: initialVersions,
            activeVersionFilter: activeFilter,
        };
        const result = {
            ...state,
            actualTypes,
            filteredDetailed,
            preparedVersion: activeFilter.value,
        };

        expect(reducer(state, action)).toEqual(result);
    });

    it(`should handle ${types.CHANGE_TYPE_FILTER}`, () => {
        const actualTypes = initialTypes;
        const actualVersions = filteredByTypeVersions;
        const filteredDetailed = filteredByTypeDetailed;

        getActualData.mockImplementation(() => ({
            actualVersions,
            actualTypes,
            filteredDetailed,
        }));

        const action = {
            type: types.CHANGE_TYPE_FILTER,
            data: {
                sortState: detailedSortState,
                newFilter: activeTypeFilter.value,
            },
        };
        const state = {
            ...initialState,
            allVersions: initialVersions,
            allTypes: initialTypes,
            actualTypes: initialTypes,
            actualVersions: initialVersions,
            activeTypeFilter: activeFilter,
        };
        const result = {
            ...state,
            actualVersions,
            filteredDetailed,
            preparedType: activeFilter.value,
        };

        expect(reducer(state, action)).toEqual(result);
    });
});
