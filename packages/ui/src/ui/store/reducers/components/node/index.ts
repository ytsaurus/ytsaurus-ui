import {combineReducers} from 'redux';

import node from './node';
import memory from './memory';
import unrecognizedOptions from './unrecognized-options';

export default combineReducers({
    node,
    memory,
    unrecognizedOptions,
});
