import _ from 'lodash';
import {RootState} from '../../reducers';
import {createSelector} from 'reselect';

export const getCreatePoolDialogCurrentTree = (state: RootState) =>
    state.schedulingCreatePoolDialog.currentTree;
export const getCreatePoolDialogTreeItems = (state: RootState) =>
    state.schedulingCreatePoolDialog.treeItems;
export const getCreatePoolDialogError = (state: RootState) =>
    state.schedulingCreatePoolDialog.error;

export const getCreatePoolDialogFlatTreeItems = createSelector(
    [getCreatePoolDialogTreeItems, getCreatePoolDialogCurrentTree],
    (tree, treeName) => {
        return {
            sortedFlatTree: collectTreeKeys([], tree).sort(),
            treeName,
        };
    },
);

function collectTreeKeys(
    dst: Array<string>,
    tree: ReturnType<typeof getCreatePoolDialogTreeItems>,
): Array<string> {
    _.forEach(tree, (value: typeof tree, key: string) => {
        dst.push(key);
        collectTreeKeys(dst, value);
    });
    return dst;
}
