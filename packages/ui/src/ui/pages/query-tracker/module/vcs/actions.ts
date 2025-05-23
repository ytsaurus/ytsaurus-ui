import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import axios from 'axios';
import {Action} from 'redux';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {
    DirectoryItem,
    FileItem,
    Repositories,
    setBranch,
    setBranches,
    setList,
    setListError,
    setListFilter,
    setPath,
    setPreview,
    setRepositories,
    setRepository,
    setVcs,
    setVcsConfig,
    setVcsTokensAvailability,
} from './vcsSlice';
import {selectVcs, selectVcsConfig} from './selectors';
import {getQueryFiles} from '../query/selectors';
import {updateQueryDraft} from '../query/actions';
import guid from '../../../../common/hammer/guid';
import {selectFileEditor} from '../queryFilesForm/selectors';
import {setFileEditor} from '../queryFilesForm/queryFilesFormSlice';
import {VcsRepository} from '../../../../../shared/vcs';
import {
    getVcsBranch,
    getVcsPath,
    getVcsRepository,
    getVcsType,
} from '../../../../store/selectors/settings/settings-vcs';
import {setSettingByKey} from '../../../../store/actions/settings';

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const TOKEN_API_URL = '/api/vcs/token';

const makePureRepositoryData = (repository: VcsRepository) => {
    return {
        name: repository.name,
        owner: 'owner' in repository ? repository.owner : undefined,
        projectId: 'projectId' in repository ? repository.projectId : undefined,
        vcsId: repository.vcsId,
    };
};

const updateVcsSettings = async (
    dispatch: any,
    settings: {
        type?: string;
        repository?: string;
        branch?: string;
        path?: string;
    },
) => {
    const updates = [];
    if ('type' in settings) {
        updates.push(dispatch(setSettingByKey('global::vcs:type', settings.type || '')));
    }
    if ('repository' in settings) {
        updates.push(
            dispatch(setSettingByKey('global::vcs:repository', settings.repository || '')),
        );
    }
    if ('branch' in settings) {
        updates.push(dispatch(setSettingByKey('global::vcs:branch', settings.branch || '')));
    }
    if ('path' in settings) {
        updates.push(dispatch(setSettingByKey('global::vcs:path', settings.path || '')));
    }
    await Promise.all(updates);
};

export const getVcsTokensAvailability = (): AsyncAction => async (dispatch) => {
    const {data} = await wrapApiPromiseByToaster(
        axios.get<{ids: string[]}>('/api/vcs/tokens-availability'),
        {
            skipSuccessToast: true,
            toasterName: 'get-vcs-tokens-availability',
        },
    );
    dispatch(setVcsTokensAvailability(data.ids));
};

export const removeToken =
    (vcsId: string): AsyncAction =>
    async (dispatch, getState) => {
        const config = selectVcsConfig(getState());

        await wrapApiPromiseByToaster(axios.delete(TOKEN_API_URL, {data: {vcsId}}), {
            toasterName: 'remove-repository-token',
        });

        const newConfig = config.map((item) => {
            if (item.id === vcsId) return {...item, hasToken: false};
            return item;
        });

        dispatch(setVcsConfig(newConfig));
    };

export const saveToken =
    (vcsId: string, token: string): AsyncAction =>
    async (dispatch, getState) => {
        const config = selectVcsConfig(getState());
        await wrapApiPromiseByToaster(axios.post(TOKEN_API_URL, {vcsId, token}), {
            toasterName: 'save-repository-token',
        });

        const newConfig = config.map((item) => {
            if (item.id === vcsId) return {...item, hasToken: true};
            return item;
        });
        dispatch(setVcsConfig(newConfig));
    };

export const getVcsRepositories =
    (vcsId?: string): AsyncAction =>
    async (dispatch) => {
        dispatch(setVcs(vcsId));
        await updateVcsSettings(dispatch, {type: vcsId, repository: '', branch: '', path: ''});

        const {data} = await wrapApiPromiseByToaster<{
            data: Repositories;
        }>(axios.get('/api/vcs/repositories', {params: {vcsId}}), {
            skipSuccessToast: true,
            toasterName: 'get-vcs-repositories',
        });

        dispatch(setRepositories(data));
        const keys = Object.keys(data);
        if (keys.length === 1) {
            dispatch(changeCurrentRepository(data[keys[0]].vcsId));
        }
    };

export const getRepositoryBranches =
    (repositoryName: string): AsyncAction =>
    async (dispatch, getState) => {
        const {repositories} = selectVcs(getState());

        const {data} = await wrapApiPromiseByToaster<{data: string[]}>(
            axios.get('/api/vcs/branches', {
                params: {repository: makePureRepositoryData(repositories[repositoryName])},
            }),
            {skipSuccessToast: true, toasterName: 'get-repository-branches'},
        );

        dispatch(setBranches(data));
    };

export const getRepositoryContent =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const {repositories, repository, branch} = selectVcs(getState());

        if (!repository) return;

        try {
            const response: {
                data: {name: string; type: string; url: string}[];
            } = await axios.get('/api/vcs', {
                params: {
                    repository: makePureRepositoryData(repositories[repository]),
                    branch,
                    path,
                },
            });

            const result = response.data.reduce<Record<string, DirectoryItem | FileItem>>(
                (acc, item) => {
                    acc[item.name] = {
                        name: item.name,
                        type: item.type !== 'tree' && item.type !== 'dir' ? 'file' : 'directory',
                        url: item.url,
                    };
                    return acc;
                },
                {},
            );

            dispatch(setListFilter(''));
            dispatch(setListError(false));
            dispatch(setList(result));
        } catch (e) {
            dispatch(setListError(true));
        } finally {
            dispatch(setPath(path));
            await updateVcsSettings(dispatch, {path});
        }
    };

const getObjectPath = (path: string, name: string) => (path ? path + '/' + name : name);

const loadFile = async (params: {path: string; repository: VcsRepository; branch: string}) => {
    const file = await wrapApiPromiseByToaster<{data: {file: string}}>(
        axios.get('/api/vcs/file', {params, responseType: 'json'}),
        {
            skipSuccessToast: true,
            toasterName: 'load-file',
        },
    );

    return file.data.file;
};

export const getContentByPath =
    (path: string): AsyncAction =>
    async (dispatch, getState) => {
        const {repositories, repository, branch} = selectVcs(getState());
        if (!repository || !branch) return;

        const name = path.includes('/') ? path.split('/').pop()! : path;

        try {
            const response = await axios.get('/api/vcs/file', {
                params: {
                    path,
                    repository: repositories[repository],
                    branch,
                },
                responseType: 'text',
            });

            dispatch(
                setPreview({
                    name,
                    content: response.data,
                }),
            );
        } catch (e) {
            await dispatch(getRepositoryContent(path));
        }
    };

export const openFilePreview =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const {path, repository, repositories, branch, list} = selectVcs(getState());
        const item = list[name];

        if (item.type !== 'file' || !repository || !branch) return;

        dispatch(
            setPreview({
                name,
                content: await loadFile({
                    path: getObjectPath(path, name),
                    repository: repositories[repository],
                    branch,
                }),
            }),
        );
    };

export const addFileToQuery =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {path, list, branch, repository, repositories} = selectVcs(state);
        const item = list[name];

        if (item.type !== 'file' || !repository || !branch) return;

        const editor = selectFileEditor(state);
        const files = getQueryFiles(state);
        const id = guid();
        dispatch(
            updateQueryDraft({
                files: [
                    ...files,
                    {
                        id,
                        name,
                        content: await loadFile({
                            path: getObjectPath(path, name),
                            repository: repositories[repository],
                            branch,
                        }),
                        type: 'raw_inline_data',
                    },
                ],
            }),
        );
        dispatch(setFileEditor({...editor, isOpen: true, fileId: id}));
    };

export const insertFileToQuery =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const {path, list, branch, repository, repositories} = selectVcs(state);
        const item = list[name];

        if (item.type !== 'file' || !repository || !branch) return;

        dispatch(
            updateQueryDraft({
                query: await loadFile({
                    path: getObjectPath(path, name),
                    repository: repositories[repository],
                    branch,
                }),
            }),
        );
    };

export const getFolderContent =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const {list, path} = selectVcs(getState());
        const item = list[name];

        if (item.type === 'file') return;

        dispatch(getRepositoryContent(getObjectPath(path, name)));
    };

export const changeCurrentRepository =
    (repositoryName: string): AsyncAction =>
    async (dispatch) => {
        dispatch(setRepository(repositoryName));
        await updateVcsSettings(dispatch, {repository: repositoryName, branch: '', path: ''});
        dispatch(getRepositoryBranches(repositoryName));
        dispatch(getRepositoryContent(''));
    };

export const changeCurrentBranch =
    (branch: string): AsyncAction =>
    async (dispatch, getState) => {
        const {path} = selectVcs(getState());
        dispatch(setBranch(branch));
        await updateVcsSettings(dispatch, {branch, path: ''});
        dispatch(getRepositoryContent(path));
    };

export const setLastVcs = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const type = getVcsType(state);
    const repository = getVcsRepository(state);
    const branch = getVcsBranch(state);
    const path = getVcsPath(state);

    if (!type) return;
    await dispatch(getVcsRepositories(type));

    if (!repository) return;
    await dispatch(changeCurrentRepository(repository));

    if (!branch) return;
    await dispatch(changeCurrentBranch(branch));

    if (!path) return;
    await dispatch(getContentByPath(path));
};
