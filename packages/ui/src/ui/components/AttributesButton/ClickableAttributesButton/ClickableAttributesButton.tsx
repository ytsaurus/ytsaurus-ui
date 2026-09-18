import {connect} from 'react-redux';

import {openAttributesModal} from '../../../store/actions/modals/attributes-modal';

import {ClickableAttributesButtonBase} from './ClickableAttributesButtonBase';

export const ClickableAttributesButton = connect(null, {openAttributesModal})(
    ClickableAttributesButtonBase,
);
