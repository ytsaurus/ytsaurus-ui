import axios from 'axios';
import {GithubRepository, VcsApi, VcsRepository} from '../../../shared/vcs';
import {ErrorWithCode} from '../../utils';

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
        return `${(repository as GithubRepository).owner}/${repository.name}`;
    }

    getRequestHeaders() {
        return {
            Authorization: `token ${this.token}`,
        };
    }

    getRepositories(): Promise<Record<string, GithubRepository>> {
        return axios
            .get<{name: string; owner: {login: string}; default_branch: string}[]>(
                `${this.baseUrl}/user/repos`,
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

    getBranches({repository}: {repository: VcsRepository}): Promise<string[]> {
        return axios
            .get<{name: string}[]>(
                `${this.baseUrl}/repos/${this.getProjectId(repository)}/branches`,
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
            .get<GithubNode[]>(
                `${this.baseUrl}/repos/${this.getProjectId(repository)}/contents/${path}`,
                {
                    headers: this.getRequestHeaders(),
                    params: {
                        ref: branch,
                    },
                },
            )
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

    async getFileContent({
        repository,
        path,
        branch,
    }: {
        repository: VcsRepository;
        branch: string;
        path: string;
    }): Promise<string> {
        const response = await axios.get<NodeJS.ReadableStream>(
            `${this.baseUrl}/repos/${this.getProjectId(repository)}/contents/${path}`,
            {
                headers: this.getRequestHeaders(),
                params: {
                    ref: branch,
                },
                responseType: 'stream',
            },
        );

        const fileStream = response.data;
        const streamData = await new Promise<string>((resolve, reject) => {
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

        return Buffer.from(JSON.parse(streamData).content, 'base64').toString();
    }
}
