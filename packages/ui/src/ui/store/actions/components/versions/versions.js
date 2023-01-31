import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {
    DISCOVER_VERSIONS,
    SORT_SUMMARY_TABLE,
    SORT_DETAILED_TABLE,
    CHANGE_VERSION_FILTER,
    CHANGE_TYPE_FILTER,
    CHANGE_ADDRESS_FILTER,
    COMPONENTS_VERSIONS_SUMMARY_TABLE_ID,
    COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
} from '../../../../constants/components/versions/versions';

export function loadVersions() {
    return (dispatch, getState) => {
        const {tables} = getState();

        const summarySortState = tables[COMPONENTS_VERSIONS_SUMMARY_TABLE_ID];
        const detailedSortState = tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

        dispatch({type: DISCOVER_VERSIONS.REQUEST});

        return yt.v3
            ._discoverVersions({})
            .then((versions) => {
                dispatch({
                    type: DISCOVER_VERSIONS.SUCCESS,
                    data: {versions, summarySortState, detailedSortState},
                });
            })
            .catch((error) => {
                dispatch({
                    type: DISCOVER_VERSIONS.FAILURE,
                    data: {error},
                });
            });
    };
}

export function sortSummaryTable() {
    return (dispatch, getState) => {
        const {tables} = getState();
        const sortState = tables[COMPONENTS_VERSIONS_SUMMARY_TABLE_ID];

        dispatch({
            type: SORT_SUMMARY_TABLE,
            data: {sortState},
        });
    };
}

export function sortDetailedTable() {
    return (dispatch, getState) => {
        const {tables} = getState();
        const sortState = tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

        dispatch({
            type: SORT_DETAILED_TABLE,
            data: {sortState},
        });
    };
}

export function changeAddressFilter(newFilter) {
    return (dispatch, getState) => {
        const {tables} = getState();
        const sortState = tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

        dispatch({
            type: CHANGE_ADDRESS_FILTER,
            data: {newFilter, sortState},
        });
    };
}

export function changeVersionFilter(newFilter) {
    return (dispatch, getState) => {
        const {tables, components} = getState();
        const {activeVersionFilter} = components.versions;
        const sortState = tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

        if (activeVersionFilter.value === newFilter) {
            return;
        }

        dispatch({
            type: CHANGE_VERSION_FILTER,
            data: {newFilter, sortState},
        });
    };
}

export function changeTypeFilter(newFilter) {
    return (dispatch, getState) => {
        const {tables, components} = getState();
        const {activeTypeFilter} = components.versions;
        const sortState = tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

        if (activeTypeFilter.value === newFilter) {
            return;
        }

        dispatch({
            type: CHANGE_TYPE_FILTER,
            data: {newFilter, sortState},
        });
    };
}
