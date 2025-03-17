import {combineReducers} from '@reduxjs/toolkit';

import {navigationWidget} from './navigation';
import {operationsWidget} from './operations';
import {queriesWidget} from './queries';
import {poolsWidget} from './pools';
import {dashboard2} from './dashboard';

export default combineReducers({
    navigationWidget,
    operationsWidget,
    queriesWidget,
    poolsWidget,
    dashboard2,
});
