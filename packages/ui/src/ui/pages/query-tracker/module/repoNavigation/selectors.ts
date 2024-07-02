import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {GithubRepository, GitlabRepository, VcsType} from '../../../../../shared/vcs';
export const selectVcsConfig = (state: RootState) => state.queryTracker.repoNavigation.vcsConfig;
export const selectRepoNavigation = (state: RootState) => state.queryTracker.repoNavigation;
export const selectList = (state: RootState) => state.queryTracker.repoNavigation.list;
export const selectPath = (state: RootState) => state.queryTracker.repoNavigation.path;
export const selectPreview = (state: RootState) => state.queryTracker.repoNavigation.preview;
export const selectListArray = createSelector([selectList], (list) => Object.values(list));
export const selectRepositories = (state: RootState) =>
    state.queryTracker.repoNavigation.repositories;
export const selectVcs = (state: RootState) => state.queryTracker.repoNavigation.vcs;
export const selectRepository = (state: RootState) => state.queryTracker.repoNavigation.repository;
export const selectBranch = (state: RootState) => state.queryTracker.repoNavigation.branch;
export const selectBranches = (state: RootState) => state.queryTracker.repoNavigation.branches;
export const selectRepositoryUrl = createSelector(
    [selectRepository, selectRepositories, selectBranch, selectVcsConfig],
    (repository, repositories, branch, config) => {
        if (!repository) return '';

        const currentRepository = repositories[repository];
        const vcs = config.find(({id}) => id === currentRepository.vcsId);

        if (!vcs) return '';

        if (vcs.type === VcsType.GITHUB)
            return `${vcs.api.replace('api.', '')}/${
                (currentRepository as GithubRepository).owner
            }/${repository}/blob/${branch}/`;

        return `${(currentRepository as GitlabRepository).webUrl}/-/blob/${branch}/`;
    },
);
