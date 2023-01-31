import {combineReducers} from 'redux';

import general from './general';
import statistics from './statistics';
import competitors from './competitors';
import specification from './specification';

export default combineReducers({
    general,
    statistics,
    competitors,
    specification,
});
