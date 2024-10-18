import {combineReducers} from 'redux';
import table from './table';
import editUser from './edit-user';
import {deleteUserModalSlice} from './delete-user';

export default combineReducers({
    table,
    editUser,
    deleteUser: deleteUserModalSlice.reducer,
});
