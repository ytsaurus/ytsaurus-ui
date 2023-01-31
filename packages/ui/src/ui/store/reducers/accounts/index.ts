import {combineReducers} from 'redux';

import accounts from './accounts/index';
import editor from './editor/index';
import usage from './usage';

export default combineReducers({
    accounts,
    editor,
    usage,
});
