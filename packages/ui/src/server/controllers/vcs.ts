import {AppRouteHandler, Response} from '@gravity-ui/expresskit';
import axios from 'axios';
import {VcsConfig, VcsRepository} from '../../shared/vcs';
import {ErrorWithCode, sendError} from '../utils';
import {VcsFactory} from '../components/vcs';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 60 * 24 * 365,
};

const ERROR_MESSAGE = {
    VCS_CONFIG_NOT_FOUND: 'vcsSettings is not found in UISettings',
    VCS_ID_REQUIRED: 'vcsId is required',
    VCS_NOT_SUPPORTED: 'The current vcsId is missing from the vcsSettings setting in UISettings',
    TOKEN_REQUIRED: 'Token is required',
    PATH_REQUIRED: 'Path is required',
    BRANCH_REQUIRED: 'Branch is required',
    REPOSITORY_REQUIRED: 'Repository is required',
    UNAUTHORIZED:
        'The service cannot authorize you. Check the token. You can add new token in the section Settings -> VCS',
};

const cookieNameByVcsId = (vcsId?: string) => {
    if (!vcsId) throw new ErrorWithCode(400, ERROR_MESSAGE.VCS_ID_REQUIRED);
    return `vcs_${vcsId}`;
};

const sendApiError = (res: Response, error: unknown) => {
    let status;
    let message;

    if (axios.isAxiosError(error)) {
        status = error.response?.status;
        message = error.response?.statusText;
    } else if (error instanceof ErrorWithCode) {
        status = error.code;
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    if (status === 401) {
        status = 500;
        message = ERROR_MESSAGE.UNAUTHORIZED;
    }

    sendError(res, message, status || 500);
};

export const getVcsConfig: AppRouteHandler = (req, res) => {
    const cookies = req.cookies;
    try {
        const config = VcsFactory.getVcsSettings(req);
        if (!config.length) throw new ErrorWithCode(404, ERROR_MESSAGE.VCS_CONFIG_NOT_FOUND);

        const response = config.map<VcsConfig>((item) => ({
            ...item,
            hasToken: cookieNameByVcsId(item.id) in cookies,
        }));
        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting vcs configuration', e);
        sendApiError(res, e);
    }
};

export const createToken: AppRouteHandler = (req, res) => {
    const {vcsId, token} = req.body;

    try {
        if (!token) throw new ErrorWithCode(400, ERROR_MESSAGE.TOKEN_REQUIRED);

        const vcs = VcsFactory.getVcsSettingById(req, vcsId);
        res.cookie(cookieNameByVcsId(vcs.id), token, COOKIE_OPTIONS);
        res.status(200).json({message: `${cookieNameByVcsId(vcs.id)} token created`});
    } catch (e) {
        req.ctx.logError('Error create token', e);
        sendApiError(res, e);
    }
};

export const removeToken: AppRouteHandler = (req, res) => {
    const {vcsId} = req.body;
    try {
        res.clearCookie(cookieNameByVcsId(vcsId));
        res.status(200).json({success: true});
    } catch (e) {
        req.ctx.logError('Error remove token', e);
        sendApiError(res, e);
    }
};

const getProjectIdByRepository = (repository: VcsRepository) => {
    return 'projectId' in repository
        ? repository.projectId
        : `${repository.owner}/${repository.name}`;
};

export const getRepositories: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const vcsId = req.query.vcsId as string | undefined;

    try {
        const token = cookies[cookieNameByVcsId(vcsId)];
        const vcs = VcsFactory.getVcsSettingById(req, vcsId);
        const api = VcsFactory.createVcs(vcs, token);
        const response = await api.getRepositories();

        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of repositories', e);
        sendApiError(res, e);
    }
};

export const getBranches: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const repository = req.query.repository as VcsRepository | undefined;

    try {
        if (!repository) throw new ErrorWithCode(400, ERROR_MESSAGE.REPOSITORY_REQUIRED);

        const token = cookies[cookieNameByVcsId(repository.vcsId)];
        const vcs = VcsFactory.getVcsSettingById(req, repository.vcsId);
        const api = VcsFactory.createVcs(vcs, token);
        const response = await api.getBranches(getProjectIdByRepository(repository));

        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of branches', e);
        sendApiError(res, e);
    }
};

export const getDirectoryContent: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const repository = req.query.repository as VcsRepository | undefined;
    const path = req.query.path as string | undefined;
    const branch = req.query.branch as string | undefined;

    try {
        if (path === undefined) throw new ErrorWithCode(400, ERROR_MESSAGE.PATH_REQUIRED);
        if (!repository) throw new ErrorWithCode(400, ERROR_MESSAGE.REPOSITORY_REQUIRED);
        if (!branch) throw new ErrorWithCode(400, ERROR_MESSAGE.BRANCH_REQUIRED);

        const token = cookies[cookieNameByVcsId(repository.vcsId)];
        const vcs = VcsFactory.getVcsSettingById(req, repository.vcsId);
        const api = VcsFactory.createVcs(vcs, token);
        const response = await api.getRepositoryContent(
            getProjectIdByRepository(repository),
            branch,
            path,
        );

        response.sort((a, b) => a.type.localeCompare(b.type));
        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of directories', e);
        sendApiError(res, e);
    }
};

export const getFileContent: AppRouteHandler = async (req, res) => {
    const cookies = req.cookies;
    const repository = req.query.repository as VcsRepository | undefined;
    const path = req.query.path as string | undefined;
    const branch = req.query.branch as string | undefined;

    try {
        if (!path) throw new ErrorWithCode(400, ERROR_MESSAGE.PATH_REQUIRED);
        if (!repository) throw new ErrorWithCode(400, ERROR_MESSAGE.REPOSITORY_REQUIRED);
        if (!branch) throw new ErrorWithCode(400, ERROR_MESSAGE.BRANCH_REQUIRED);

        const token = cookies[cookieNameByVcsId(repository.vcsId)];
        const vcs = VcsFactory.getVcsSettingById(req, repository.vcsId);
        const api = VcsFactory.createVcs(vcs, token);
        const response = await api.getFileContent(
            getProjectIdByRepository(repository),
            branch,
            path,
        );

        res.set('content-type', 'text/json');
        res.set({
            'Content-Type': response.headers['content-type'],
            'Content-Length': response.headers['content-length'],
            'Content-Disposition': `attachment; filename=${path}`,
        });

        response.data.pipe(res);
    } catch (e) {
        req.ctx.logError('Error getting file content', e);
        sendApiError(res, e);
    }
};
