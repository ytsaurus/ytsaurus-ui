import {combineReducers} from 'redux';

import attributesModal from './attributes-modal';
import errors from './errors';

export default combineReducers({
    attributesModal,
    errors,
});
