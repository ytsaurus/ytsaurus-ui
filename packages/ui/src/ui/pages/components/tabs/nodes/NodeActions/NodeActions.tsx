import {connect} from 'react-redux';

import {selectCluster} from '../../../../../store/selectors/global';
import {showNodeMaintenance} from '../../../../../store/actions/components/node-maintenance-modal';
import {type RootState} from '../../../../../store/reducers';

import {NodeActionsBase} from './NodeActionsBase';

const mapStateToProps = (state: RootState) => {
    return {
        cluster: selectCluster(state),
    };
};

const mapDispatchToProps = {
    showNodeMaintenance,
};

const NodeActions = connect(mapStateToProps, mapDispatchToProps)(NodeActionsBase);

export default NodeActions;
