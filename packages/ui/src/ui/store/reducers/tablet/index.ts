import {combineReducers} from 'redux';

import stores from './stores';
import tablet from './tablet';

export default combineReducers({
    tablet,
    stores,
});
