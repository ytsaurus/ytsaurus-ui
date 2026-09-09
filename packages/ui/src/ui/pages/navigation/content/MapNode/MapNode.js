import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';
import {selectIsCreateTableModalVisible} from '../../../../store/selectors/navigation/modals/create-table';

import {openCreateTableModal} from '../../../../store/actions/navigation/modals/create-table';
import {selectPath, selectTransaction} from '../../../../store/selectors/navigation';
import {selectNavigationPathAttributes} from '../../../../store/selectors/navigation/navigation';
import {selectMediumList} from '../../../../store/selectors/thor';
import {
    selectContentMode,
    selectError,
    selectFilterState,
    selectLoadState,
    selectMediumType,
} from '../../../../store/selectors/navigation/content/map-node';

import {LOADING_STATUS} from '../../../../constants/index';

import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {
    fetchNodes,
    setContentMode,
    setFilter,
    setMediumType,
} from '../../../../store/actions/navigation/content/map-node';
import {openEditingPopup} from '../../../../store/actions/navigation/modals/path-editing-popup';

import {openCreateACOModal} from '../../../../store/actions/navigation/modals/create-aco';
import {showLinkToModal} from '../../../../store/actions/navigation/modals/link-to-modal';
import {selectCluster} from '../../../../store/selectors/global';

import './MapNode.scss';

import {MapNodeBase} from './MapNodeBase';

function mapStateToProps(state) {
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

const MapNodeConnected = connect(mapStateToProps, mapDispatchToProps)(MapNodeBase);

export default function MapNodeWithRum() {
    const mapNodeLoadState = useSelector(selectLoadState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_MAP_NODE,
        startDeps: [mapNodeLoadState],
        allowStart: ([loadState]) => {
            return loadState === LOADING_STATUS.LOADING;
        },
    });
    return <MapNodeConnected />;
}
