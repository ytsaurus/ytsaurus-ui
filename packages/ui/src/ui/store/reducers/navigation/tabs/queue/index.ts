import {combineReducers} from 'redux';

import filters from './filters';
import partitions from './partitions';
import status from './status';
import {consumers} from './consumers';

export default combineReducers({
    filters,
    partitions,
    status,
    consumers,
});
