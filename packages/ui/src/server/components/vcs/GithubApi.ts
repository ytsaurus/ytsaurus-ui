import axios, {AxiosResponse} from 'axios';
import {GithubRepository} from '../../../shared/vcs';
import {VcsApi} from './index';

export type GithubNode = {
    download_url: string;
    git_url: string;
    html_url: string;
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir';
    url: string;
};

export class GithubApi implements VcsApi {
    token: string;
    api: string;
    vcsId: string;

    constructor({token, api, vcsId}: {token: string; api: string; vcsId: string}) {
        this.token = token;
        this.api = api;
        this.vcsId = vcsId;
    }

    getRequestHeaders() {
        return {
            Authorization: `token ${this.token}`,
        };
    }

    getRepositories(): Promise<Record<string, GithubRepository>> {
        return axios
            .get<{name: string; owner: {login: string}; default_branch: string}[]>(
                `${this.api}/user/repos`,
                {
                    headers: this.getRequestHeaders(),
                },
            )
            .then((response) => {
                return response.data.reduce<Record<string, GithubRepository>>(
                    (acc, repositoryData) => {
                        acc[repositoryData.name] = {
                            name: repositoryData.name,
                            owner: repositoryData.owner.login,
                            defaultBranch: repositoryData.default_branch,
                            vcsId: this.vcsId,
                        };
                        return acc;
                    },
                    {},
                );
            });
    }

    getBranches(projectId: string): Promise<string[]> {
        return axios
            .get<{name: string}[]>(`${this.api}/repos/${projectId}/branches`, {
                headers: this.getRequestHeaders(),
            })
            .then((response) => {
                return response.data.map((i) => i.name);
            });
    }

    getRepositoryContent(
        projectId: string,
        branch: string,
        path = '',
    ): Promise<{name: string; type: 'file' | 'dir'; url: string}[]> {
        return axios
            .get<GithubNode[]>(`${this.api}/repos/${projectId}/contents/${path}`, {
                headers: this.getRequestHeaders(),
                params: {
                    ref: branch,
                },
            })
            .then((response) => {
                return response.data.map((item) => {
                    return {
                        name: item.name,
                        type: item.type,
                        url: item.html_url,
                    };
                });
            });
    }

    getFileContent(
        projectId: string,
        branch: string,
        path: string,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        return axios.get<NodeJS.ReadableStream>(`${this.api}/repos/${projectId}/contents/${path}`, {
            headers: this.getRequestHeaders(),
            params: {
                ref: branch,
            },
            responseType: 'stream',
        });
    }
}
