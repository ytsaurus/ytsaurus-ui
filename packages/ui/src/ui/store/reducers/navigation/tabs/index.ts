import {combineReducers} from 'redux';

import accessLog from './access-log';
import consumer from './consumer';
import locks from './locks';
import queue from './queue';
import schema from './schema/schema';
import annotation from './annotation';
import tablets from './tablets/tablets';
import tabletErrorsBackground from './tablet-errors/tablet-errors-background';
import {tabletErrorsByPath} from './tablet-errors/tablet-errors-by-path';
import userAttributes from './user-attributes';

export default combineReducers({
    accessLog,
    consumer,
    locks,
    queue,
    schema,
    tablets,
    annotation,
    tabletErrorsBackground,
    tabletErrorsByPath,
    userAttributes,
});
