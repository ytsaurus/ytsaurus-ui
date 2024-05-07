import {VCSSettings} from '../../../shared/ui-settings';
import {GithubApi} from './GithubApi';
import {GitlabApi} from './GitlabApi';
import {AxiosResponse} from 'axios';
import {Request} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';
import {ErrorWithCode} from '../../utils';

export interface VcsApi {
    token: string;
    api: string;
    vcsId: string;

    getRequestHeaders(): {Authorization: string};
    getRepositories(): Promise<unknown>;
    getBranches(projectId: string): Promise<string[]>;
    getRepositoryContent(projectId: string, branch: string, path: string): Promise<unknown[]>;
    getFileContent(
        projectId: string,
        branch: string,
        path: string,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>>;
}

export class VcsFactory {
    static createVcs(vcs: VCSSettings, token?: string) {
        if (!token) throw new ErrorWithCode(400, 'Token is required');

        const apiConfig = {token, api: vcs.api, vcsId: vcs.id};
        switch (vcs.type) {
            case 'github':
                return new GithubApi(apiConfig);
            case 'gitlab':
                return new GitlabApi(apiConfig);
            default:
                throw new ErrorWithCode(415, `Unsupported VCS type: ${vcs.type}`);
        }
    }

    static getVcsSettings(req: Request): VCSSettings[] {
        const {uiSettings} = req.ctx.config as AppConfig;

        if (!('vcsSettings' in uiSettings))
            throw new ErrorWithCode(404, 'vcsSettings is not found in UISettings');

        return uiSettings.vcsSettings;
    }

    static getVcsSettingById(req: Request, vcsId?: string): VCSSettings {
        if (!vcsId) throw new ErrorWithCode(400, 'vcsId is required');

        const result = this.getVcsSettings(req).find((vcs) => vcs.id === vcsId);
        if (!result)
            throw new ErrorWithCode(
                500,
                'The current vcsId is missing from the vcsSettings setting in UISettings',
            );

        return result;
    }
}
