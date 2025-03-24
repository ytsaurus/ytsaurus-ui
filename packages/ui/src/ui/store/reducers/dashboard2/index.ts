import {combineReducers} from '@reduxjs/toolkit';
import {dashboard2} from './dashboard';
import {navigationWidget} from './navigation';
import {operationsWidget} from './operations';

export default combineReducers({
    operationsWidget,
    navigationWidget,
    dashboard2,
});
