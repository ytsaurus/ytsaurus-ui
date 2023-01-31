import {combineReducers} from 'redux';
import table from './table';
import editor from './editor';

export default combineReducers({
    table,
    editor,
});
