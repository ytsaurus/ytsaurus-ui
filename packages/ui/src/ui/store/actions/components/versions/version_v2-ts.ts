import {CHANGE_VERSION_SUMMARY_PARTIAL} from '../../../../constants/components/versions/versions_v2';
import {SortState} from '../../../../types';

export function changeVersionStateTypeFilters(data: {
    version?: string;
    state?: string;
    type?: string;
    banned?: boolean;
}) {
    const {version, state, type, banned} = data;
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {
            stateFilter: state || 'all',
            versionFilter: version || 'all',
            typeFilter: type || 'all',
            bannedFilter: banned === undefined ? 'all' : banned,
        },
    };
}

export function setVersionsSummarySortState(summarySortState: SortState) {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {summarySortState},
    };
}

export function changeCheckedHideOffline(checkedHideOffline: boolean) {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {checkedHideOffline},
    };
}
