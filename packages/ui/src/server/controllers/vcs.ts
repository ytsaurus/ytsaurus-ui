import {AppRouteHandler, Request, Response} from '@gravity-ui/expresskit';
import {GithubApi} from '../classes/GithubApi';
import {GitlabApi} from '../classes/GitlabApi';
import {UISettings, VCSSettings} from '../../shared/ui-settings';
import {AxiosError} from 'axios';
import {AppConfig} from '@gravity-ui/nodekit';
import {GithubRepository, GitlabRepository, VcsConfig, VcsType} from '../../shared/vcs';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 60 * 24 * 365,
};

const ERROR_MESSAGE = {
    VCS_CONFIG_NOT_FOUND: 'Vcs config is not found',
    VCS_ID_REQUIRED: 'Vcs id is required',
    VCS_NOT_SUPPORTED: 'This vcs id is not supported',
    TOKEN_REQUIRED: 'Token is required',
    PATH_REQUIRED: 'Path is required',
    BRANCH_REQUIRED: 'Branch is required',
    REPOSITORY_REQUIRED: 'Repository is required',
    UNAUTHORIZED:
        'The service cannot authorize you. Check the token. You can add new token in the section Settings -> VCS',
};

const cookieNameByVcsId = (vcsId: string) => `vcs_${vcsId}`;

const loadVcsConfig = (req: Request): VCSSettings[] => {
    const {uiSettings} = req.ctx.config as AppConfig & {uiSettings: UISettings};
    return uiSettings.vcsSettings || [];
};

const getApiInstance = (vcs: VCSSettings, token: string): GithubApi | GitlabApi => {
    const apiConfig = {token, api: vcs.api, vcsId: vcs.id};
    return vcs.type === VcsType.GITHUB ? new GithubApi(apiConfig) : new GitlabApi(apiConfig);
};

const sendError = (res: Response, status: number, message: string) => {
    res.status(status).send({message, code: status});
};

const sendApiError = (res: Response, error: AxiosError) => {
    let status = error.response?.status;
    let message = error.response?.statusText;

    if (status === 401) {
        status = 500;
        message = ERROR_MESSAGE.UNAUTHORIZED;
    }

    sendError(res, status || 500, message || error.message);
};

export const getVcsConfig: AppRouteHandler = (req, res) => {
    const cookies = req.cookies;
    try {
        const config = loadVcsConfig(req);
        if (!config.length) {
            sendError(res, 404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);
            return;
        }

        const response = config.map<VcsConfig>((item) => ({
            ...item,
            token: cookieNameByVcsId(item.id) in cookies,
        }));
        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting vcs configuration', e);
        sendError(res, 500, (e as Error).message);
    }
};

export const createToken: AppRouteHandler = (req, res) => {
    const {vcsId, token} = req.body;

    if (!vcsId) {
        sendError(res, 400, ERROR_MESSAGE.VCS_ID_REQUIRED);
        return;
    }

    const config = loadVcsConfig(req);

    if (!config.length) {
        sendError(res, 404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);
        return;
    }

    const vcs = config.find((item) => item.id === vcsId);
    if (!vcs) {
        sendError(res, 400, ERROR_MESSAGE.VCS_NOT_SUPPORTED);
        return;
    }

    if (!token) {
        sendError(res, 400, ERROR_MESSAGE.TOKEN_REQUIRED);
        return;
    }

    res.cookie(cookieNameByVcsId(vcsId), token, COOKIE_OPTIONS);
    res.status(200).json({message: `${cookieNameByVcsId(vcsId)} token created`});
};

export const removeToken: AppRouteHandler = (req, res) => {
    const {vcsId} = req.body;

    if (!vcsId) {
        sendError(res, 400, ERROR_MESSAGE.VCS_ID_REQUIRED);
    }

    res.clearCookie(cookieNameByVcsId(vcsId));
    res.status(200).json({success: true});
};

export const getRepositories: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const vcsId = req.query.vcsId as string | undefined;

    if (!vcsId) {
        sendError(res, 400, ERROR_MESSAGE.VCS_ID_REQUIRED);
        return;
    }

    const token = cookies[cookieNameByVcsId(vcsId)];
    if (!token) {
        sendError(res, 400, ERROR_MESSAGE.TOKEN_REQUIRED);
        return;
    }

    const config = loadVcsConfig(req);
    if (!config.length) {
        sendError(res, 404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);
        return;
    }

    const vcs = config.find((item) => item.id === vcsId);
    if (!vcs) {
        sendError(res, 400, ERROR_MESSAGE.VCS_NOT_SUPPORTED);
        return;
    }

    const api = getApiInstance(vcs, token);
    try {
        const response = await api.getRepositories();
        if (response instanceof AxiosError) {
            sendApiError(res, response);
            return;
        }
        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of repositories', e);
        sendError(res, 500, (e as Error).message);
    }
};

export const getBranches: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const repository = req.query.repository as GithubRepository | GitlabRepository | undefined;

    if (!repository) {
        sendError(res, 400, ERROR_MESSAGE.REPOSITORY_REQUIRED);
        return;
    }

    const token = cookies[cookieNameByVcsId(repository.vcsId)];
    if (!token) {
        sendError(res, 400, ERROR_MESSAGE.TOKEN_REQUIRED);
        return;
    }

    const config = loadVcsConfig(req);
    if (!config.length) {
        sendError(res, 404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);
        return;
    }

    const vcs = config.find((item) => item.id === repository.vcsId);
    if (!vcs) {
        sendError(res, 400, ERROR_MESSAGE.VCS_NOT_SUPPORTED);
        return;
    }

    try {
        const api = getApiInstance(vcs, token);
        let response;
        if (api instanceof GitlabApi) {
            response = await api.getBranches((repository as GitlabRepository).projectId);
        } else {
            response = await api.getBranches(
                (repository as GithubRepository).owner,
                repository.name,
            );
        }

        if (response instanceof AxiosError) {
            sendApiError(res, response);
            return;
        }

        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of branches', e);
        sendError(res, 500, (e as Error).message);
    }
};

export const getDirectoryContent: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const repository = req.query.repository as GithubRepository | GitlabRepository | undefined;
    const path = req.query.path as string | undefined;
    const branch = req.query.branch as string | undefined;

    if (path === undefined) {
        sendError(res, 400, ERROR_MESSAGE.PATH_REQUIRED);
        return;
    }

    if (!repository) {
        sendError(res, 400, ERROR_MESSAGE.REPOSITORY_REQUIRED);
        return;
    }

    if (!branch) {
        sendError(res, 400, ERROR_MESSAGE.BRANCH_REQUIRED);
        return;
    }

    const token = cookies[cookieNameByVcsId(repository.vcsId)];
    if (!token) {
        sendError(res, 400, ERROR_MESSAGE.TOKEN_REQUIRED);
        return;
    }

    const config = loadVcsConfig(req);
    if (!config.length) {
        sendError(res, 404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);
        return;
    }

    const vcs = config.find((item) => item.id === repository.vcsId);
    if (!vcs) {
        sendError(res, 400, ERROR_MESSAGE.VCS_NOT_SUPPORTED);
        return;
    }

    try {
        const api = getApiInstance(vcs, token);
        let response;
        if (api instanceof GitlabApi) {
            response = await api.getRepositoryContent(
                (repository as GitlabRepository).projectId,
                branch,
                path,
            );
        } else {
            response = await api.getContent(
                (repository as GithubRepository).owner,
                repository.name,
                path,
                branch,
            );
        }

        if (response instanceof AxiosError) {
            sendApiError(res, response);
            return;
        }

        response.sort((a, b) => a.type.localeCompare(b.type));
        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of directories', e);
        sendError(res, 500, (e as Error).message);
    }
};

export const getFileContent: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const repository = req.query.repository as GithubRepository | GitlabRepository | undefined;
    const path = req.query.path as string | undefined;
    const branch = req.query.branch as string | undefined;

    if (!path) {
        sendError(res, 400, ERROR_MESSAGE.PATH_REQUIRED);
        return;
    }

    if (!repository) {
        sendError(res, 400, ERROR_MESSAGE.REPOSITORY_REQUIRED);
        return;
    }

    if (!branch) {
        sendError(res, 400, ERROR_MESSAGE.BRANCH_REQUIRED);
        return;
    }

    const token = cookies[cookieNameByVcsId(repository.vcsId)];
    if (!token) {
        sendError(res, 400, ERROR_MESSAGE.TOKEN_REQUIRED);
        return;
    }

    const config = loadVcsConfig(req);
    if (!config.length) {
        sendError(res, 404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);
        return;
    }

    const vcs = config.find((item) => item.id === repository.vcsId);
    if (!vcs) {
        sendError(res, 400, ERROR_MESSAGE.VCS_NOT_SUPPORTED);
        return;
    }

    try {
        res.set('content-type', 'text/json');
        const api = getApiInstance(vcs, token);
        let response;
        if (api instanceof GitlabApi) {
            response = await api.getFileContent(
                (repository as GitlabRepository).projectId,
                branch,
                path,
            );
        } else {
            response = await api.getFileContent(
                (repository as GithubRepository).owner,
                repository.name,
                path,
                branch,
            );
        }

        if (response instanceof AxiosError) {
            sendApiError(res, response);
            return;
        }

        res.status(200).send(response);
    } catch (e) {
        req.ctx.logError('Error getting file content', e);
        sendError(res, 500, (e as Error).message);
    }
};
