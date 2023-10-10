import {combineReducers} from 'redux';

import scheduling from './scheduling';
import expandedPools from './expanded-pools';
import createPoolDialog from './create-pool-dialog';

export default combineReducers({scheduling, expandedPools, createPoolDialog});
