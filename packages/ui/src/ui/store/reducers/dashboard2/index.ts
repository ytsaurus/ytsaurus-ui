import {combineReducers} from '@reduxjs/toolkit';

import {navigationWidget} from './navigation';
import {dashboard2} from './dashboard';

export default combineReducers({
    navigationWidget,
    dashboard2,
});
