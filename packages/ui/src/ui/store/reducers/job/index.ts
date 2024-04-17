import {combineReducers} from 'redux';

import general from './general';
import competitors from './competitors';
import specification from './specification';

export default combineReducers({
    general,
    competitors,
    specification,
});
