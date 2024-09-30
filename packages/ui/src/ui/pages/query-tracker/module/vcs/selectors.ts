import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
export const selectVcsConfig = (state: RootState) => state.queryTracker.vcs.vcsConfig || [];
export const selectIsVcsVisible = (state: RootState) =>
    !state.queryTracker.vcs.vcsConfig || state.queryTracker.vcs.vcsConfig.length !== 0;
export const selectVcs = (state: RootState) => state.queryTracker.vcs;
export const selectList = (state: RootState) => state.queryTracker.vcs.list;
export const selectPath = (state: RootState) => state.queryTracker.vcs.path;
export const selectPreview = (state: RootState) => state.queryTracker.vcs.preview;
export const selectRepositories = (state: RootState) => state.queryTracker.vcs.repositories;
export const selectCurrentVcs = (state: RootState) => state.queryTracker.vcs.vcs;
export const selectRepository = (state: RootState) => state.queryTracker.vcs.repository;
export const selectBranch = (state: RootState) => state.queryTracker.vcs.branch;
export const selectBranches = (state: RootState) => state.queryTracker.vcs.branches;
export const selectListFilter = (state: RootState) => state.queryTracker.vcs.listFilter;
export const selectListError = (state: RootState) => state.queryTracker.vcs.listError;

export const selectShowFilter = createSelector([selectBranch, selectPreview], (branch, preview) => {
    return Boolean(branch && !preview.name);
});

export const selectListArray = createSelector([selectList, selectListFilter], (list, filter) => {
    const listArray = Object.values(list);
    return filter ? listArray.filter((item) => item.name.includes(filter)) : listArray;
});

export const selectCurrentRepository = createSelector(
    [selectRepository, selectRepositories],
    (repository, repositories) => {
        if (!repository) return null;
        return repositories[repository];
    },
);
