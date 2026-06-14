import {combineReducers} from 'redux';

import node from './node';
import memory from './memory';
import runningJobs from './running-jobs';
import unrecognizedOptions from './unrecognized-options';

export default combineReducers({
    node,
    memory,
    runningJobs,
    unrecognizedOptions,
});
