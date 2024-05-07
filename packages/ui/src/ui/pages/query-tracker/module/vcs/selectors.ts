import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
export const selectVcsConfig = (state: RootState) => state.queryTracker.vcs.vcsConfig;
export const selectVcs = (state: RootState) => state.queryTracker.vcs;
export const selectList = (state: RootState) => state.queryTracker.vcs.list;
export const selectPath = (state: RootState) => state.queryTracker.vcs.path;
export const selectPreview = (state: RootState) => state.queryTracker.vcs.preview;
export const selectListArray = createSelector([selectList], (list) => Object.values(list));
export const selectRepositories = (state: RootState) => state.queryTracker.vcs.repositories;
export const selectCurrentVcs = (state: RootState) => state.queryTracker.vcs.vcs;
export const selectRepository = (state: RootState) => state.queryTracker.vcs.repository;
export const selectBranch = (state: RootState) => state.queryTracker.vcs.branch;
export const selectBranches = (state: RootState) => state.queryTracker.vcs.branches;
export const selectCurrentRepository = createSelector(
    [selectRepository, selectRepositories],
    (repository, repositories) => {
        if (!repository) return null;
        return repositories[repository];
    },
);
