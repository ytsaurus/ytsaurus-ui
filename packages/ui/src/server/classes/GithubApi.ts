import axios, {AxiosError} from 'axios';
import {GithubRepository, VcsType} from '../../shared/vcs';

export class GithubApi {
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

    async getRepositories(): Promise<Record<string, GithubRepository> | AxiosError> {
        try {
            const response = await axios.get<
                {name: string; owner: {login: string}; default_branch: string}[]
            >(`${this.api}/user/repos`, {
                headers: this.getRequestHeaders(),
            });

            return response.data.reduce<Record<string, GithubRepository>>((acc, repositoryData) => {
                acc[repositoryData.name] = {
                    name: repositoryData.name,
                    owner: repositoryData.owner.login,
                    defaultBranch: repositoryData.default_branch,
                    vcsId: VcsType.GITHUB,
                };
                return acc;
            }, {});
        } catch (e) {
            return e as AxiosError;
        }
    }

    async getBranches(owner: string, repositoryName: string): Promise<string[] | AxiosError> {
        try {
            const response = await axios.get<{name: string}[]>(
                `${this.api}/repos/${owner}/${repositoryName}/branches`,
                {
                    headers: this.getRequestHeaders(),
                },
            );

            return response.data.map((i) => i.name);
        } catch (e) {
            return e as AxiosError;
        }
    }

    async getContent(
        owner: string,
        repo: string,
        path: string,
        branch: string,
    ): Promise<{name: string; type: 'tree' | 'blob'}[] | AxiosError> {
        try {
            const response = await axios.get(
                `${this.api}/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        ref: branch,
                    },
                },
            );

            return response.data;
        } catch (e) {
            return e as AxiosError;
        }
    }

    async getFileContent(
        owner: string,
        repo: string,
        path: string,
        branch: string,
    ): Promise<string | AxiosError> {
        try {
            const response = await axios.get(
                `${this.api}/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        ref: branch,
                    },
                },
            );

            return Buffer.from(response.data.content, 'base64').toString();
        } catch (e) {
            return e as AxiosError;
        }
    }
}
