import {combineReducers} from 'redux';

import nodes from './nodes/nodes';
import setup from './setup/setup';

export default combineReducers({
    nodes,
    setup,
});
