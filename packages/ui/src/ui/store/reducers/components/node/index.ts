import {combineReducers} from 'redux';

import node from './node';
import memory from './memory';

export default combineReducers({
    node,
    memory,
});
