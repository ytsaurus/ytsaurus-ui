import {combineReducers} from 'redux';

import proxies from './proxies/proxies';
import changeRole from './actions/change-role';

export default combineReducers({
    proxies,
    changeRole,
});
