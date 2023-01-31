import {combineReducers} from 'redux';

import filters from './accounts-usage-filters';
import snapshots from './accounts-usage-snapshots';
import list from './accounts-usage-list';
import tree from './accounts-usage-tree';
import listDiff from './accounts-usage-list-diff';
import treeDiff from './accounts-usage-tree-diff';

export default combineReducers({
    snapshots,
    list,
    tree,
    filters,
    listDiff,
    treeDiff,
});
