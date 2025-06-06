import {combineReducers} from 'redux';

import {attributes} from './attributes';
import accessLog from './access-log';
import consumer from './consumer';
import locks from './locks';
import queue from './queue';
import schema from './schema/schema';
import tablets from './tablets/tablets';
import tabletErrorsBackground from './tablet-errors/tablet-errors-background';
import {tabletErrorsByPath} from './tablet-errors/tablet-errors-by-path';
import {userAttributes} from './user-attributes';

export default combineReducers({
    accessLog,
    attributes,
    consumer,
    locks,
    queue,
    schema,
    tablets,
    tabletErrorsBackground,
    tabletErrorsByPath,
    userAttributes,
});
