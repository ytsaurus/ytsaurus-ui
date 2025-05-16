import {combineReducers} from '@reduxjs/toolkit';

import {navigationWidget} from './navigation';
import {operationsWidget} from './operations';
import {dashboard2} from './dashboard';

export default combineReducers({
    navigationWidget,
    operationsWidget,
    dashboard2,
});
