import {connect} from 'react-redux';

import {type RootState} from '../../../../store/reducers';
import {
    selectHideOfflineValue,
    selectSummarySortState,
    selectVersions,
    selectVersionsSummaryData,
} from '../../../../store/selectors/components/versions/versions_v2-ts';
import {
    changeCheckedHideOffline,
    changeVersionStateTypeFilters,
    setVersionsSummarySortState,
} from '../../../../store/actions/components/versions/versions_v2';
import {selectCluster} from '../../../../store/selectors/global';

import './VersionSummary.scss';

import {VersionSummaryBase} from './VersionSummaryBase';

const mapStateToProps = (state: RootState) => {
    const {loading, loaded} = state.components.versionsV2;
    const cluster = selectCluster(state);

    const sortState = selectSummarySortState(state);

    const visibleColumns = selectVersions(state);
    const items = selectVersionsSummaryData(state);

    return {
        loading: loading as boolean,
        loaded: loaded as boolean,
        cluster,
        items,
        sortState,
        checkedHideOffline: selectHideOfflineValue(state),
        visibleColumns,
    };
};

const mapDispatchToProps = {
    changeVersionStateTypeFilters,
    setVersionsSummarySortState,
    changeCheckedHideOffline,
};

const VersionSummary = connect(mapStateToProps, mapDispatchToProps)(VersionSummaryBase);

export default VersionSummary;
