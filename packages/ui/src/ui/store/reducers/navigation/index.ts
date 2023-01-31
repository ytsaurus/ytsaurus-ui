import {combineReducers} from 'redux';

import pathEditor from './path-editor/path-editor';
import navigation from './navigation';
import content from './content';
import modals from './modals';
import tabs from './tabs';

export default combineReducers({
    pathEditor,
    navigation,
    content,
    modals,
    tabs,
});
