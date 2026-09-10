import {connect} from 'react-redux';
import {showEditPoolsWeightsModal} from '../../../../../../store/actions/operations';

import {RuntimeBase} from './RuntimeBase';

const mapDispatchToProps = {
    showEditPoolsWeightsModal,
};

const Runtime = connect(null, mapDispatchToProps)(RuntimeBase);

export default Runtime;
