import {connect} from 'react-redux';
import {selectIsCreateTableModalVisible} from '../../../../../store/selectors/navigation/modals/create-table';

import {openCreateTableModal} from '../../../../../store/actions/navigation/modals/create-table';
import {selectPath, selectTransaction} from '../../../../../store/selectors/navigation';
import {selectNavigationPathAttributes} from '../../../../../store/selectors/navigation/navigation';
import {selectMediumList} from '../../../../../store/selectors/thor';
import {
    selectContentMode,
    selectError,
    selectFilterState,
    selectLoadState,
    selectMediumType,
} from '../../../../../store/selectors/navigation/content/map-node';

import {openEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {
    fetchNodes,
    setContentMode,
    setFilter,
    setMediumType,
} from '../../../../../store/actions/navigation/content/map-node';
import {showLinkToModal} from '../../../../../store/actions/navigation/modals/link-to-modal';
import {openCreateACOModal} from '../../../../../store/actions/navigation/modals/create-aco';
import {selectCluster} from '../../../../../store/selectors/global';
import {type RootState} from '../../../../../store/reducers';

import './MapNodeToolbar.scss';

import {MapNodeToolbarBase} from './MapNodeToolbarBase';

function mapStateToProps(state: RootState) {
    const path = selectPath(state);

    return {
        path,
        showACOCreateButton: path === '//sys/access_control_object_namespaces/queries',
        loadState: selectLoadState(state),
        error: selectError(state),
        contentMode: selectContentMode(state),
        filterState: selectFilterState(state),
        transaction: selectTransaction(state),
        mediumList: selectMediumList(state),
        mediumType: selectMediumType(state),
        showCreateTableModal: selectIsCreateTableModalVisible(state),
        attributes: selectNavigationPathAttributes(state),
        cluster: selectCluster(state),
    };
}

const mapDispatchToProps = {
    setFilter,
    setContentMode,
    fetchNodes,
    setMediumType,
    openEditingPopup,
    openCreateTableModal,
    showLinkToModal,
    openCreateACOModal,
};

export const MapNodeToolbar = connect(mapStateToProps, mapDispatchToProps)(MapNodeToolbarBase);
