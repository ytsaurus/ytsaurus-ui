import {combineReducers} from 'redux';

import nodes from './nodes/nodes';
import setup from './setup/setup';
import resourcesLimit from './actions/set-resources-limits';

export default combineReducers({
    nodes,
    setup,
    resourcesLimit,
});
