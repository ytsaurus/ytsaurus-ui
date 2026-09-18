import {connect} from 'react-redux';
import {compose} from 'redux';

import {
    selectComponentNodesFiltersCount,
    selectComponentNodesTableProps,
    selectComponentsNodesNodeTypes,
    selectVisibleNodes,
} from '../../../../../store/selectors/components/nodes/nodes';
import {selectSelectedColumns} from '../../../../../store/selectors/settings';
import {selectSettingsEnableSideBar} from '../../../../../store/selectors/settings/settings-ts';
import {defaultColumns} from '../../../../../pages/components/tabs/nodes/tables';
import withVisible from '../../../../../hocs/withVisible';
import {
    changeContentMode,
    changeHostFilter,
    handleColumnsChange,
} from '../../../../../store/actions/components/nodes/nodes';

import {mergeScreen, splitScreen as splitScreenAction} from '../../../../../store/actions/global';
import {type RootState} from '../../../../../store/reducers';

import './Nodes.scss';

import {NodesBase} from './NodesBase';

const mapStateToProps = (state: RootState) => {
    const {splitScreen} = state.global;
    const {contentMode, nodes, loading, loaded, error, errorData, hostFilter} =
        state.components.nodes.nodes;

    const visibleNodes = selectVisibleNodes(state);
    const selectedColumns = selectSelectedColumns(state) || defaultColumns;
    const initialLoading = loading && !loaded;

    const nodesTableProps = selectComponentNodesTableProps(state);

    const sideBarEnabled = selectSettingsEnableSideBar(state);

    return {
        loading,
        loaded,
        error,
        errorData,

        nodes: visibleNodes,
        totalItems: nodes.length,
        showingItems: visibleNodes.length,
        selectedColumns,
        hostFilter,
        contentMode,
        splitScreen,
        initialLoading,
        nodesTableProps,
        sideBarEnabled,
        nodeTypes: selectComponentsNodesNodeTypes(state),
        filterCount: selectComponentNodesFiltersCount(state),
    };
};

const mapDispatchToProps = {
    changeContentMode,
    splitScreenAction,
    changeHostFilter,
    mergeScreen,
    handleColumnsChange,
};

const Nodes = compose(connect(mapStateToProps, mapDispatchToProps), withVisible)(NodesBase);

export default Nodes;
