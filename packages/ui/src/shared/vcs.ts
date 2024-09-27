import {Request, Response} from '@gravity-ui/expresskit';
import {VCSSettings} from './ui-settings';

type Requests = {req: Request; res: Response};

export interface VcsApi {
    getRepositories(requests?: Requests): Promise<unknown>;
    getBranches(params: {
        repository: VcsRepository;
        requests?: Requests;
    }): Promise<{value: string; text: string}[] | string[]>;
    getRepositoryContent(params: {
        repository: VcsRepository;
        branch: string;
        path: string;
        requests?: Requests;
    }): Promise<{name: string; type: string; url: string}[]>;
    getFileContent(params: {
        repository: VcsRepository;
        branch: string;
        path: string;
        requests?: Requests;
    }): Promise<string>;
}

export type Repository = {
    name: string;
    defaultBranch: string;
    vcsId: string;
};

export type GithubRepository = Repository & {
    owner: string;
};

export type GitlabRepository = Repository & {
    webUrl: string;
    projectId: string;
};

export type VcsRepository = Repository | GithubRepository | GitlabRepository;

export type VcsConfig = VCSSettings & {
    hasToken: boolean;
};
