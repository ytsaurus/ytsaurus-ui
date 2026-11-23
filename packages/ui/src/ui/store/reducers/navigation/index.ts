import {combineReducers} from 'redux';

import pathEditor from './path-editor/path-editor';
import navigation from './navigation';
import content from './content';
import modals from './modals';
import tabs from './tabs';
import {description} from './description';
import {resetTableData} from './content/table/table';

const combinedReducer = combineReducers({
    description,
    pathEditor,
    navigation,
    content,
    modals,
    tabs,
});

const navigationReducer: typeof combinedReducer = (state, action) => {
    const nextState = combinedReducer(state, action);
    const previousNode = state?.navigation;
    const nextNode = nextState.navigation;

    if (
        previousNode &&
        (previousNode.path !== nextNode.path || previousNode.transaction !== nextNode.transaction)
    ) {
        return {
            ...nextState,
            content: {
                ...nextState.content,
                table: resetTableData(nextState.content.table),
            },
        };
    }

    return nextState;
};

export default navigationReducer;
