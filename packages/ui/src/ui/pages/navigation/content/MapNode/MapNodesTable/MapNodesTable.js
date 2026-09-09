import React from 'react';
import {connect} from 'react-redux';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {
    navigateParent,
    setMode,
    updatePath,
    updateView,
} from '../../../../../store/actions/navigation';
import {setSelectedItem} from '../../../../../store/actions/navigation/content/map-node';
import {showTableEraseModal} from '../../../../../store/actions/navigation/modals/table-erase-modal';
import {
    showTableMergeModal,
    showTableSortModal,
} from '../../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectTransaction} from '../../../../../store/selectors/navigation';
import {
    selectContentMode,
    selectLoadState,
    selectPreparedTableColumns,
    selectSelected,
    selectSelectedIndex,
    selectSortedNodes,
} from '../../../../../store/selectors/navigation/content/map-node';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import './MapNodesTable.scss';

import {MapNodesTableBase} from './MapNodesTableBase';

function mapStateToProps(state) {
    return {
        loadState: selectLoadState(state),
        columns: selectPreparedTableColumns(state),
        transaction: selectTransaction(state),
        contentMode: selectContentMode(state),
        nodes: selectSortedNodes(state),
        selected: selectSelected(state),
        selectedIndex: selectSelectedIndex(state),
    };
}

const mapDispatchToProps = {
    setSelectedItem,
    navigateParent,
    updateView,
    updatePath,
    setMode,
    showTableEraseModal,
    showTableSortModal,
    showTableMergeModal,
};

const MapNodesTableConnected = connect(mapStateToProps, mapDispatchToProps)(MapNodesTableBase);

export default function MapNodesTableWithRum() {
    const mapNodeLoadState = useSelector(selectLoadState);
    const sortedNodes = useSelector(selectSortedNodes);

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_MAP_NODE,
        stopDeps: [sortedNodes, mapNodeLoadState],
        allowStop: ([nodes, loadState]) => {
            return Boolean(nodes) && isFinalLoadingStatus(loadState);
        },
    });

    return <MapNodesTableConnected />;
}
