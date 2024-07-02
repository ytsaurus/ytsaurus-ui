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
    setPath,
    setPreview,
    setRepositories,
    setRepository,
    setVcs,
    setVcsConfig,
} from './repoNavigationSlice';
import {selectRepoNavigation, selectVcsConfig} from './selectors';
import {getQueryFiles} from '../query/selectors';
import {updateQueryDraft} from '../query/actions';
import guid from '../../../../common/hammer/guid';
import {selectFileEditor} from '../queryFilesForm/selectors';
import {setFileEditor} from '../queryFilesForm/queryFilesFormSlice';
import {GithubRepository, GitlabRepository, VcsConfig} from '../../../../../shared/vcs';

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const TOKEN_API_URL = '/api/token';

const makePureRepositoryData = (repository: GitlabRepository | GithubRepository) => {
    return {
        name: repository.name,
        owner: 'owner' in repository ? repository.owner : undefined,
        projectId: 'projectId' in repository ? repository.projectId : undefined,
        vcsId: repository.vcsId,
    };
};

export const getVcsConfig = (): AsyncAction => async (dispatch) => {
    const {data} = await wrapApiPromiseByToaster<{data: VcsConfig[]}>(
        axios.get('/api/vcs/config'),
        {
            skipSuccessToast: true,
            toasterName: 'get-vcs-config',
        },
    );

    dispatch(setVcsConfig(data));
};

export const removeToken =
    (vcsId: string): AsyncAction =>
    async (dispatch, getState) => {
        const config = selectVcsConfig(getState());

        await wrapApiPromiseByToaster(axios.delete(TOKEN_API_URL, {data: {vcsId}}), {
            toasterName: 'remove-repository-token',
        });

        const newConfig = config.map((item) => {
            if (item.id === vcsId) return {...item, token: false};
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
            if (item.id === vcsId) return {...item, token: true};
            return item;
        });
        dispatch(setVcsConfig(newConfig));
    };

export const getVcsRepositories =
    (vcsId?: string): AsyncAction =>
    async (dispatch) => {
        dispatch(setVcs(vcsId));

        const {data} = await wrapApiPromiseByToaster<{
            data: Repositories;
        }>(axios.get('/api/vcs/repositories', {params: {vcsId}}), {
            skipSuccessToast: true,
            toasterName: 'get-vcs-repositories',
        });

        dispatch(setRepositories(data));
    };

export const getRepositoryBranches =
    (repositoryName: string): AsyncAction =>
    async (dispatch, getState) => {
        const {repositories} = selectRepoNavigation(getState());

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
        const {repositories, repository, branch} = selectRepoNavigation(getState());

        if (!repository) return;

        const response = await wrapApiPromiseByToaster<{data: {name: string; type: string}[]}>(
            axios.get('/api/vcs', {
                params: {
                    repository: makePureRepositoryData(repositories[repository]),
                    branch,
                    path,
                },
            }),
            {
                skipSuccessToast: true,
                toasterName: 'load-repository-content',
            },
        );

        const result = response.data.reduce<Record<string, DirectoryItem | FileItem>>(
            (acc, item) => {
                acc[item.name] = {
                    name: item.name,
                    type: item.type !== 'tree' && item.type !== 'dir' ? 'file' : 'directory',
                };
                return acc;
            },
            {},
        );

        dispatch(setList(result));
        dispatch(setPath(path));
    };

export const goBack = (): AsyncAction => async (dispatch, getState) => {
    const {path} = selectRepoNavigation(getState());

    const parentPath = path.split('/').slice(0, -1).join('/');
    dispatch(getRepositoryContent(parentPath));
};

const getObjectPath = (path: string, name: string) => (path ? path + '/' + name : name);

const loadFile = async (params: {
    path: string;
    repository: GithubRepository | GitlabRepository;
    branch: string;
}) => {
    const file = await wrapApiPromiseByToaster<{data: string}>(
        axios.get('/api/vcs/file', {params, responseType: 'text'}),
        {
            skipSuccessToast: true,
            toasterName: 'load-file',
        },
    );

    return file.data;
};

export const openFilePreview =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const {path, repository, repositories, branch, list} = selectRepoNavigation(getState());
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
        const {path, list, branch, repository, repositories} = selectRepoNavigation(state);
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

export const getFolderContent =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const {list, path} = selectRepoNavigation(getState());
        const item = list[name];

        if (item.type === 'file') return;

        dispatch(getRepositoryContent(getObjectPath(path, name)));
    };

export const changeCurrentRepository =
    (repositoryName: string): AsyncAction =>
    async (dispatch, getState) => {
        const {path} = selectRepoNavigation(getState());

        dispatch(setRepository(repositoryName));

        dispatch(getRepositoryBranches(repositoryName));
        dispatch(getRepositoryContent(path));
    };

export const changeCurrentBranch =
    (branch: string): AsyncAction =>
    async (dispatch, getState) => {
        const {path} = selectRepoNavigation(getState());
        dispatch(setBranch(branch));
        dispatch(getRepositoryContent(path));
    };
