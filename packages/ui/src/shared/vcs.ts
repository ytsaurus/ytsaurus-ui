import {VCSSettings} from './ui-settings';

export type GithubRepository = {
    name: string;
    owner: string;
    defaultBranch: string;
    vcsId: string;
};

export type GitlabRepository = {
    name: string;
    webUrl: string;
    projectId: string;
    defaultBranch: string;
    vcsId: string;
};

export type VcsRepository = GithubRepository | GitlabRepository;

export type VcsConfig = VCSSettings & {
    hasToken: boolean;
};
