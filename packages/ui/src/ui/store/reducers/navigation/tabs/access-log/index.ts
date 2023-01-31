import {combineReducers} from 'redux';

import accessLog from './access-log';
import accessLogFilters from './access-log-filters';

export default combineReducers({
    accessLog,
    accessLogFilters,
});
