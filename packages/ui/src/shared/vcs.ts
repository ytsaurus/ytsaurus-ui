import {VCSSettings} from './ui-settings';

export enum VcsType {
    GITHUB = 'github',
    GITLAB = 'gitlab',
}

export type GithubRepository = {
    name: string;
    owner: string;
    defaultBranch: string;
    vcsId: VcsType.GITHUB;
};

export type GitlabRepository = {
    name: string;
    webUrl: string;
    projectId: string;
    defaultBranch: string;
    vcsId: VcsType.GITLAB;
};

export type VcsConfig = VCSSettings & {
    token: boolean;
};
