import {VCSSettings} from '../../../shared/ui-settings';
import {GithubApi} from './GithubApi';
import {GitlabApi} from './GitlabApi';
import {Request} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';
import {ErrorWithCode} from '../../utils';
import ServerFactory from '../../ServerFactory';
import {VCS_DEFAULT_MAX_FILE_SIZE} from '../../../shared/constants/vcs';

export class VcsFactory {
    static createVcs(vcs: VCSSettings, token?: string) {
        const apiConfig = {
            token,
            baseUrl: vcs.baseUrl,
            vcsId: vcs.id,
            maxFileSize: vcs.maxFileSize || VCS_DEFAULT_MAX_FILE_SIZE,
        };
        switch (vcs.type) {
            case 'github':
                return new GithubApi(apiConfig);
            case 'gitlab':
                return new GitlabApi(apiConfig);
            default: {
                const vcsApi = ServerFactory.createCustomVcsApi(vcs.type, vcs, token);
                if (!vcsApi) throw new ErrorWithCode(400, `Unsupported VCS type`);
                return vcsApi;
            }
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
