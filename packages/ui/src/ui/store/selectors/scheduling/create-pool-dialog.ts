import forEach_ from 'lodash/forEach';

import {type RootState} from '../../reducers';
import {createSelector} from 'reselect';

export const selectCreatePoolDialogCurrentTree = (state: RootState) =>
    state.scheduling.createPoolDialog.currentTree;
export const selectCreatePoolDialogTreeItems = (state: RootState) =>
    state.scheduling.createPoolDialog.treeItems;
export const selectCreatePoolDialogError = (state: RootState) =>
    state.scheduling.createPoolDialog.error;

export const selectCreatePoolDialogFlatTreeItems = createSelector(
    [selectCreatePoolDialogTreeItems, selectCreatePoolDialogCurrentTree],
    (tree, treeName) => {
        return {
            sortedFlatTree: collectTreeKeys([], tree).sort(),
            treeName,
        };
    },
);

function collectTreeKeys(
    dst: Array<string>,
    tree: ReturnType<typeof selectCreatePoolDialogTreeItems>,
): Array<string> {
    forEach_(tree, (value: typeof tree, key: string) => {
        dst.push(key);
        collectTreeKeys(dst, value);
    });
    return dst;
}
