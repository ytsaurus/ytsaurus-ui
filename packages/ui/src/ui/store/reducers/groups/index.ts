import {combineReducers} from 'redux';
import table from './table';
import editor from './editor';
import {deleteGroupModalSlice} from './delete-group';

export default combineReducers({
    table,
    editor,
    deleteGroup: deleteGroupModalSlice.reducer,
});
