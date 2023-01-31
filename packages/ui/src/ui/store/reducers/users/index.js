import {combineReducers} from 'redux';
import table from './table';
import editUser from './edit-user';

export default combineReducers({
    table,
    editUser,
});
