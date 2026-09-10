import {connect} from 'react-redux';

import {
    selectBannedSelectItems,
    selectStatesSelectItems,
    selectTypeSelectItems,
    selectVersionSelectItems,
    selectVisibleDetails,
} from '../../../../store/selectors/components/versions/versions_v2';
import {
    changeBannedFilter,
    changeHostFilter,
    changeStateFilter,
    changeTypeFilter,
    changeVersionFilter,
} from '../../../../store/actions/components/versions/versions_v2';
import {type RootState} from '../../../../store/reducers';

import './Versions.scss';

import {VersionsV2Base} from './VersionsV2Base';

const mapStateToProps = (state: RootState) => {
    const {
        loading,
        loaded,
        error,
        hostFilter,
        versionFilter,
        typeFilter,
        stateFilter,
        bannedFilter,
        details: allDetails,
    } = state.components.versionsV2;

    const details = selectVisibleDetails(state);
    const versionSelectItems = selectVersionSelectItems(state);
    const typeSelectItems = selectTypeSelectItems(state);
    const stateSelectItems = selectStatesSelectItems(state);
    const bannedSelectItems = selectBannedSelectItems(state);

    const showingItems = details.length;
    const totalItems = allDetails.length;

    return {
        loading,
        loaded,
        error,
        details,
        showingItems,
        totalItems,
        hostFilter,
        versionFilter,
        typeFilter,
        stateFilter,
        bannedFilter,
        versionSelectItems,
        typeSelectItems,
        stateSelectItems,
        bannedSelectItems,
    };
};

const mapDispatchToProps = {
    changeHostFilter,
    changeVersionFilter,
    changeTypeFilter,
    changeStateFilter,
    changeBannedFilter,
};

const VersionsV2 = connect(mapStateToProps, mapDispatchToProps)(VersionsV2Base);

export default VersionsV2;
