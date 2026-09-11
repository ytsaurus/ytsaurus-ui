import {connect} from 'react-redux';

import {openAttributesModal} from '../../../../../store/actions/modals/attributes-modal';

import {NodeCountBase} from './NodeCountBase';

const mapDispatchToProps = {openAttributesModal};

export const NodeCount = connect(null, mapDispatchToProps)(NodeCountBase);
