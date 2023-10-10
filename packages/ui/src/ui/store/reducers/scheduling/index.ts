import {combineReducers} from 'redux';

import scheduling from './scheduling';
import operations from './scheduling-operations';
import createPoolDialog from './create-pool-dialog';

export default combineReducers({scheduling, operations, createPoolDialog});
