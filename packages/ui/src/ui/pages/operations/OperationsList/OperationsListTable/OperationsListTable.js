import {withRouter} from 'react-router';
import {connect} from 'react-redux';

import {
    showEditPoolsWeightsModal,
    updateOperationsList,
} from '../../../../store/actions/operations';
import {promptAction} from '../../../../store/actions/actions';

import './OperationsListTable.scss';

import {OperationsListTableBase} from './OperationsListTableBase';

function mapStateToProps({operations, global}) {
    const {isLoading, hasLoaded} = operations.list;
    const initialLoading = isLoading && !hasLoaded;

    return {
        initialLoading,
        cluster: global.cluster,
        operations: operations.list.operations,
    };
}

const mapDispatchToProps = {
    showEditPoolsWeightsModal,
    promptAction,
    updateOperationsList,
};

const OperationsListTable = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(OperationsListTableBase),
);

export default OperationsListTable;
