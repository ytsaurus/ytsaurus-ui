import {combineReducers} from 'redux';

import filters from './filters';
import partitions from './partitions';
import status from './status';
import {exports} from './exports';

export default combineReducers({
    filters,
    partitions,
    status,
    exports,
});
