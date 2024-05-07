import axios, {AxiosResponse} from 'axios';
import {GitlabRepository} from '../../../shared/vcs';
import {VcsApi} from './index';

export type GitlabNode = {
    id: string;
    mode: string;
    name: string;
    path: string;
    type: 'tree' | 'blob';
};

export class GitlabApi implements VcsApi {
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
            Authorization: `Bearer ${this.token}`,
        };
    }

    getRepositories(): Promise<Record<string, GitlabRepository>> {
        return axios
            .get<{name: string; id: number; web_url: string; default_branch: string}[]>(this.api, {
                headers: this.getRequestHeaders(),
                params: {
                    owned: true,
                },
            })
            .then((response) => {
                return response.data.reduce<Record<string, GitlabRepository>>(
                    (acc, repositoryData) => {
                        acc[repositoryData.name] = {
                            name: repositoryData.name,
                            webUrl: `${repositoryData.web_url}`,
                            projectId: repositoryData.id.toString(),
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
            .get<{name: string}[]>(`${this.api}/${projectId}/repository/branches`, {
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
    ): Promise<{name: string; type: 'tree' | 'blob'; url: string}[]> {
        return axios
            .get<GitlabNode[]>(`${this.api}/${projectId}/repository/tree?path=${path}`, {
                headers: this.getRequestHeaders(),
                params: {
                    ref_name: branch,
                },
            })
            .then((response) => {
                return response.data.map((item) => {
                    return {
                        name: item.name,
                        type: item.type,
                        url: `/-/blob/${branch}/${item.name}`,
                    };
                });
            });
    }

    getFileContent(
        projectId: string,
        branch: string,
        path: string,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        return axios.get<NodeJS.ReadableStream>(
            `${this.api}/${projectId}/repository/files/${path}/raw`,
            {
                headers: this.getRequestHeaders(),
                params: {
                    ref_name: branch,
                },
                responseType: 'stream',
            },
        );
    }
}
