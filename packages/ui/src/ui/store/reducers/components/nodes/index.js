import {combineReducers} from 'redux';

import nodes from './nodes/nodes';
import setup from './setup/setup';
import disableEnable from './actions/disable-enable';
import resourcesLimit from './actions/set-resources-limits';

export default combineReducers({
    nodes,
    setup,
    disableEnable,
    resourcesLimit,
});
