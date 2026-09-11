import {connect} from 'react-redux';
import {
    applyPreset,
    getComponentsNodesFilterOptions,
    savePreset,
} from '../../../../../store/actions/components/nodes/nodes';

import {selectMediumListNoCache} from '../../../../../store/selectors/thor';
import {
    selectComponentNodesFiltersSetup,
    selectComponentNodesRacks,
    selectComponentNodesTags,
} from '../../../../../store/selectors/components/nodes/nodes';
import {
    COMPONENTS_AVAILABLE_STATES,
    selectComponentNodesFilterSetupStateValue,
} from '../../../../../store/selectors/components/nodes/nodes/data';

import './SetupModal.scss';

import {SetupModalBase} from './SetupModalBase';

const mapStateToProps = (state) => {
    return {
        setup: selectComponentNodesFiltersSetup(state),
        mediumList: selectMediumListNoCache(state),
        nodeTags: selectComponentNodesTags(state),
        nodeRacks: selectComponentNodesRacks(state),
        nodeStates: COMPONENTS_AVAILABLE_STATES,
        stateValue: selectComponentNodesFilterSetupStateValue(state),
    };
};

const SetupModal = connect(mapStateToProps, {
    applyPreset,
    savePreset,
    loadOptions: getComponentsNodesFilterOptions,
})(SetupModalBase);

export default SetupModal;
