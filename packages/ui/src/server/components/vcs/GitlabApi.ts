import axios from 'axios';
import {GitlabRepository, VcsApi, VcsRepository} from '../../../shared/vcs';
import {ErrorWithCode} from '../../utils';

export type GitlabNode = {
    id: string;
    mode: string;
    name: string;
    path: string;
    type: 'tree' | 'blob';
};

export class GitlabApi implements VcsApi {
    token: string;
    baseUrl: string;
    vcsId: string;
    maxFileSize: number;

    constructor({
        token,
        baseUrl,
        vcsId,
        maxFileSize,
    }: {
        token?: string;
        baseUrl: string;
        vcsId: string;
        maxFileSize: number;
    }) {
        if (!token) throw new ErrorWithCode(400, 'Token is required');

        this.token = token;
        this.baseUrl = baseUrl;
        this.vcsId = vcsId;
        this.maxFileSize = maxFileSize;
    }

    getProjectId(repository: VcsRepository) {
        return (repository as GitlabRepository).projectId;
    }

    getRequestHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
        };
    }

    getRepositories(): Promise<Record<string, GitlabRepository>> {
        return axios
            .get<{name: string; id: number; web_url: string; default_branch: string}[]>(
                this.baseUrl,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        owned: true,
                    },
                },
            )
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

    getBranches({repository}: {repository: VcsRepository}): Promise<string[]> {
        return axios
            .get<{name: string}[]>(
                `${this.baseUrl}/${this.getProjectId(repository)}/repository/branches`,
                {
                    headers: this.getRequestHeaders(),
                },
            )
            .then((response) => {
                return response.data.map((i) => i.name);
            });
    }

    getRepositoryContent({
        repository,
        branch,
        path = '',
    }: {
        repository: VcsRepository;
        branch: string;
        path?: string;
    }): Promise<{name: string; type: 'file' | 'dir'; url: string}[]> {
        return axios
            .get<GitlabNode[]>(
                `${this.baseUrl}/${this.getProjectId(repository)}/repository/tree?path=${path}`,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        ref_name: branch,
                    },
                },
            )
            .then((response) => {
                return response.data.map((item) => {
                    return {
                        name: item.name,
                        type: item.type === 'tree' ? 'dir' : 'file',
                        url: `/-/blob/${branch}/${item.name}`,
                    };
                });
            });
    }

    async getFileContent({
        repository,
        branch,
        path,
    }: {
        repository: VcsRepository;
        branch: string;
        path: string;
    }): Promise<string> {
        const response = await axios.get<NodeJS.ReadableStream>(
            `${this.baseUrl}/${this.getProjectId(repository)}/repository/files/${path}/raw`,
            {
                headers: this.getRequestHeaders(),
                params: {
                    ref_name: branch,
                },
                responseType: 'stream',
            },
        );

        const fileStream = response.data;
        return await new Promise<string>((resolve, reject) => {
            let temp = '';
            fileStream.on('data', (chunk: string) => {
                temp += chunk.toString();

                if (Buffer.byteLength(temp) > this.maxFileSize)
                    reject(new Error(`File is too big. Max size ${this.maxFileSize}Mb`));
            });

            fileStream.on('end', () => {
                resolve(temp);
            });

            fileStream.on('error', (err: Error) => {
                reject(err);
            });
        });
    }
}
