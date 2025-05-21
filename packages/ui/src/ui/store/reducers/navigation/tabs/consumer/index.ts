import {combineReducers} from 'redux';

import filters from './filters';
import partitions from './partitions';
import status from './status';
import register from './register';

export default combineReducers({
    filters,
    partitions,
    status,
    register,
});
