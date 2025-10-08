import {AppRouteHandler, Request, Response} from '@gravity-ui/expresskit';
import {VcsRepository} from '../../shared/vcs';
import {ErrorWithCode} from '../utils';
import {VcsFactory} from '../components/vcs';
import {sendApiError} from '../utils/sendApiError';

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
    TOKENS_ERROR: 'Error getting vcs tokens availability',
    PATH_REQUIRED: 'Path is required',
    BRANCH_REQUIRED: 'Branch is required',
    REPOSITORY_REQUIRED: 'Repository is required',
    UNAUTHORIZED:
        'The service cannot authorize you. Check the token. You can add new token in the section Settings -> VCS',
};
const VCS_COOKIE_PREFIX = 'vcs_token_';

const cookieNameByVcsId = (vcsId?: string) => {
    if (!vcsId) throw new ErrorWithCode(400, ERROR_MESSAGE.VCS_ID_REQUIRED);
    return VCS_COOKIE_PREFIX + vcsId;
};

export const getVcsTokensAvailability: AppRouteHandler = (req: Request, res: Response) => {
    const {cookies} = req;
    try {
        const config = VcsFactory.getVcsSettings(req);
        if (!config) throw new ErrorWithCode(404, ERROR_MESSAGE.TOKENS_ERROR);

        const vcsTokenKeys = Object.keys(cookies).filter((name) =>
            name.startsWith(VCS_COOKIE_PREFIX),
        );
        const ids = config.reduce<string[]>((acc, {id}) => {
            if (vcsTokenKeys.includes(VCS_COOKIE_PREFIX + id)) {
                acc.push(id);
            }
            return acc;
        }, []);
        res.status(200).json({ids});
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.TOKENS_ERROR, e);
        sendApiError(res, e);
    }
};

export const createToken: AppRouteHandler = (req: Request, res: Response) => {
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

export const removeToken: AppRouteHandler = (req: Request, res: Response) => {
    const {vcsId} = req.body;
    try {
        res.clearCookie(cookieNameByVcsId(vcsId));
        res.status(200).json({success: true});
    } catch (e) {
        req.ctx.logError('Error remove token', e);
        sendApiError(res, e);
    }
};

export const getRepositories: AppRouteHandler = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const vcsId = req.query.vcsId as string | undefined;

    try {
        const token = cookies[cookieNameByVcsId(vcsId)];
        const vcs = VcsFactory.getVcsSettingById(req, vcsId);
        const api = VcsFactory.createVcs(vcs, token);
        const response = await api.getRepositories({req, res});

        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of repositories', e);
        sendApiError(res, e);
    }
};

export const getBranches: AppRouteHandler = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const repository = req.query.repository as VcsRepository | undefined;

    try {
        if (!repository) throw new ErrorWithCode(400, ERROR_MESSAGE.REPOSITORY_REQUIRED);

        const token = cookies[cookieNameByVcsId(repository.vcsId)];
        const vcs = VcsFactory.getVcsSettingById(req, repository.vcsId);
        const api = VcsFactory.createVcs(vcs, token);
        const response = await api.getBranches({
            repository,
            requests: {req, res},
        });

        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of branches', e);
        sendApiError(res, e);
    }
};

export const getDirectoryContent: AppRouteHandler = async (req: Request, res: Response) => {
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
        const response = await api.getRepositoryContent({
            repository,
            branch,
            path,
            requests: {
                req,
                res,
            },
        });

        response.sort((a, b) => {
            if (a.type === 'dir' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'dir') return 1;

            return a.name.localeCompare(b.name, undefined, {sensitivity: 'base'});
        });

        res.status(200).json(response);
    } catch (e) {
        req.ctx.logError('Error getting list of directories', e);
        sendApiError(res, e);
    }
};

export const getFileContent: AppRouteHandler = async (req: Request, res: Response) => {
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
        const file = await api.getFileContent({
            repository,
            branch,
            path,
            requests: {
                req,
                res,
            },
        });

        res.set('content-type', 'text/json');
        res.set('Content-Disposition', `attachment; filename=${path}`);
        res.status(200).send({file});
    } catch (e) {
        req.ctx.logError('Error getting file content', e);
        sendApiError(res, e);
    }
};
