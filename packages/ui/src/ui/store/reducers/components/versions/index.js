import {
    CHANGE_ADDRESS_FILTER,
    CHANGE_TYPE_FILTER,
    CHANGE_VERSION_FILTER,
    DISCOVER_VERSIONS,
    SORT_DETAILED_TABLE,
    SORT_SUMMARY_TABLE,
} from '../../../../constants/components/versions/versions';
import {
    aggregateDetailed,
    aggregateSummary,
    getActiveFilter,
    getActualData,
    getFilterColumns,
    prepareVersions,
    sortDetailed,
    sortSummary,
} from '../../../../utils/components/versions/index';

const totalItem = {text: 'All', value: 'total', count: 0};

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    allVersions: [{...totalItem}],
    actualVersions: [{...totalItem}],
    allTypes: [{...totalItem}],
    actualTypes: [{...totalItem}],
    detailed: [],
    filteredDetailed: [],
    summary: [],
    activeVersionFilter: {...totalItem},
    preparedVersion: totalItem.value,
    activeTypeFilter: {...totalItem},
    preparedType: totalItem.value,
    activeAddressFilter: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case DISCOVER_VERSIONS.REQUEST:
            return {...state, loading: true};

        case DISCOVER_VERSIONS.SUCCESS: {
            const {versions, summarySortState, detailedSortState} = action.data;
            const {preparedVersion, preparedType, activeAddressFilter} = state;

            const preparedVersions = prepareVersions(versions);
            const aggregatedSummary = aggregateSummary(preparedVersions);

            const summary = sortSummary(aggregatedSummary, summarySortState);
            const detailed = aggregateDetailed(preparedVersions);

            const allVersions = getFilterColumns(detailed, 'version');
            const allTypes = getFilterColumns(detailed, 'type');

            const activeVersionFilter = getActiveFilter(allVersions, preparedVersion);
            const activeTypeFilter = getActiveFilter(allTypes, preparedType);
            const filters = {
                activeAddressFilter,
                activeVersionFilter,
                activeTypeFilter,
            };

            const actualData = getActualData(filters, detailed, detailedSortState);

            return {
                ...state,
                ...actualData,
                summary,
                detailed,
                activeVersionFilter,
                activeTypeFilter,
                allVersions,
                allTypes,
                loading: false,
                loaded: true,
                error: false,
            };
        }

        case DISCOVER_VERSIONS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case SORT_SUMMARY_TABLE: {
            const {sortState} = action.data;
            const summaryVersions = state.summary;
            const summary = sortSummary(summaryVersions, sortState);

            return {...state, summary};
        }

        case SORT_DETAILED_TABLE: {
            const {sortState} = action.data;
            const detailedVersions = state.filteredDetailed;
            const filteredDetailed = sortDetailed(detailedVersions, sortState);

            return {...state, filteredDetailed};
        }

        case CHANGE_ADDRESS_FILTER: {
            const {newFilter, sortState} = action.data;
            const {detailed, activeVersionFilter, activeTypeFilter} = state;

            const activeAddressFilter = newFilter;
            const filters = {
                activeAddressFilter,
                activeVersionFilter,
                activeTypeFilter,
            };
            const actualData = getActualData(filters, detailed, sortState);

            return {...state, ...actualData, activeAddressFilter};
        }

        case CHANGE_VERSION_FILTER: {
            const {newFilter, sortState} = action.data;
            const {detailed, activeTypeFilter, activeAddressFilter, allVersions} = state;

            const activeVersionFilter = getActiveFilter(allVersions, newFilter);
            const filters = {
                activeAddressFilter,
                activeVersionFilter,
                activeTypeFilter,
            };
            const actualData = getActualData(filters, detailed, sortState);
            const preparedVersion = activeVersionFilter.value;

            return {
                ...state,
                ...actualData,
                activeVersionFilter,
                preparedVersion,
            };
        }

        case CHANGE_TYPE_FILTER: {
            const {newFilter, sortState} = action.data;
            const {detailed, activeVersionFilter, activeAddressFilter, allTypes} = state;

            const activeTypeFilter = getActiveFilter(allTypes, newFilter);
            const filters = {
                activeAddressFilter,
                activeVersionFilter,
                activeTypeFilter,
            };
            const actualData = getActualData(filters, detailed, sortState);
            const preparedType = activeTypeFilter.value;

            return {...state, ...actualData, activeTypeFilter, preparedType};
        }

        default:
            return state;
    }
};
