import axios, {AxiosError} from 'axios';
import {GitlabRepository, VcsType} from '../../shared/vcs';

export class GitlabApi {
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

    async getRepositories(): Promise<Record<string, GitlabRepository> | AxiosError> {
        try {
            const response = await axios.get<
                {name: string; id: number; web_url: string; default_branch: string}[]
            >(this.api, {
                headers: this.getRequestHeaders(),
                params: {
                    owned: true,
                },
            });

            return response.data.reduce<Record<string, GitlabRepository>>((acc, repositoryData) => {
                acc[repositoryData.name] = {
                    name: repositoryData.name,
                    webUrl: repositoryData.web_url,
                    projectId: repositoryData.id.toString(),
                    defaultBranch: repositoryData.default_branch,
                    vcsId: VcsType.GITLAB,
                };
                return acc;
            }, {});
        } catch (e) {
            return e as AxiosError;
        }
    }

    async getBranches(projectId: string): Promise<string[] | AxiosError> {
        try {
            const response = await axios.get<{name: string}[]>(
                `${this.api}/${projectId}/repository/branches`,
                {
                    headers: this.getRequestHeaders(),
                },
            );

            return response.data.map((i) => i.name);
        } catch (e) {
            return e as AxiosError;
        }
    }

    async getRepositoryContent(
        projectId: string,
        branch: string,
        path = '',
    ): Promise<
        {id: string; mode: string; name: string; path: string; type: 'tree' | 'blob'}[] | AxiosError
    > {
        try {
            const response = await axios.get(
                `${this.api}/${projectId}/repository/tree?path=${path}`,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        ref_name: branch,
                    },
                },
            );

            return await response.data;
        } catch (e) {
            return e as AxiosError;
        }
    }

    async getFileContent(
        projectId: string,
        branch: string,
        filePath: string,
    ): Promise<string | AxiosError> {
        try {
            const response = await axios.get(
                `${this.api}/${projectId}/repository/files/${filePath}/raw`,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        ref_name: branch,
                    },
                },
            );

            return response.data;
        } catch (e) {
            return e as AxiosError;
        }
    }
}
