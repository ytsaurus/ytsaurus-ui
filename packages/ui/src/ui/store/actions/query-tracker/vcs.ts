import {type ThunkAction, type ThunkDispatch} from 'redux-thunk';
import {type RootState} from '../../reducers';
import axios from 'axios';
import {type Action} from 'redux';
import {v4 as uuidv4} from 'uuid';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {
    type DirectoryItem,
    type FileItem,
    type Repositories,
    type VcsFileContext,
    type VcsState,
    setBranch,
    setBranches,
    setFileActionRequestId,
    setList,
    setListError,
    setListFilter,
    setNavigationId,
    setPath,
    setPreview,
    setPreviewRequestId,
    setRepositories,
    setRepository,
    setVcs,
    setVcsConfig,
    setVcsRequest,
    setVcsTokensAvailability,
} from '../../reducers/query-tracker/vcsSlice';
import {selectVcs, selectVcsConfig} from '../../selectors/query-tracker/vcs';
import {selectQueryFiles} from '../../selectors/query-tracker/query';
import {updateQueryDraft} from './query';
import {selectFileEditor} from '../../selectors/query-tracker/queryFilesForm';
import {setFileEditor} from '../../reducers/query-tracker/queryFilesFormSlice';
import {type VcsRepository} from '../../../../shared/vcs';
import {
    selectVcsBranch,
    selectVcsPath,
    selectVcsRepository,
    selectVcsType,
} from '../../selectors/settings/settings-vcs';
import {setSettingByKey} from '../settings';
import {selectQuerySessionRevision} from '../../selectors/query-tracker/querySession';
import {createVcsFileContext, joinVcsPath, normalizeVcsPath} from './vcsHelpers';

type AsyncAction = ThunkAction<Promise<void>, RootState, undefined, Action>;

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
    dispatch: ThunkDispatch<RootState, undefined, Action>,
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
    // Persisting preferences must not leave the browser stuck in a loading state.
    // setSettingByKey already reports individual persistence errors.
    await Promise.allSettled(updates);
};

export const getVcsTokensAvailability = (): AsyncAction => async (dispatch) => {
    try {
        const {data} = await wrapApiPromiseByToaster(
            axios.get<{ids: string[]}>('/api/vcs/tokens-availability'),
            {
                skipSuccessToast: true,
                toasterName: 'get-vcs-tokens-availability',
            },
        );
        dispatch(setVcsTokensAvailability(data.ids));
    } catch {
        // The toaster reports token availability failures.
    }
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

// A navigation id covers the whole provider -> repository -> branch -> directory chain.
// Starting another navigation invalidates every response from the previous chain.
const isCurrent = (getState: () => RootState, id: string) =>
    selectVcs(getState()).navigationId === id;

export const getRepositoryBranches =
    (repositoryName: string, navigationId = uuidv4()): AsyncAction =>
    async (dispatch, getState) => {
        dispatch(setNavigationId(navigationId));
        const repository = selectVcs(getState()).repositories[repositoryName];
        if (!repository) return;
        dispatch(
            setVcsRequest({kind: 'branches', state: {loading: true, error: false, loaded: false}}),
        );
        try {
            const {data} = await wrapApiPromiseByToaster(
                axios.get<VcsState['branches']>('/api/vcs/branches', {
                    params: {repository: makePureRepositoryData(repository)},
                }),
                {skipSuccessToast: true, toasterName: 'get-repository-branches'},
            );
            if (!isCurrent(getState, navigationId)) return;
            dispatch(setBranches(data));
            dispatch(setVcsRequest({kind: 'branches', state: {loading: false, loaded: true}}));
        } catch {
            if (isCurrent(getState, navigationId)) {
                dispatch(setVcsRequest({kind: 'branches', state: {loading: false, error: true}}));
            }
        }
    };

export const getRepositoryContent =
    (rawPath: string, navigationId = uuidv4()): AsyncAction =>
    async (dispatch, getState) => {
        dispatch(setNavigationId(navigationId));
        const {repositories, repository, branch} = selectVcs(getState());
        if (!repository || !repositories[repository] || !branch) return;
        const path = normalizeVcsPath(rawPath);
        dispatch(setPreview({name: '', content: ''}));
        dispatch(setPath(path));
        dispatch(setList({}));
        dispatch(setListFilter(''));
        dispatch(setListError(false));
        dispatch(
            setVcsRequest({kind: 'list', state: {loading: true, loaded: false, error: false}}),
        );
        try {
            const {data} = await axios.get<{name: string; type: string; url: string}[]>(
                '/api/vcs',
                {
                    params: {
                        repository: makePureRepositoryData(repositories[repository]),
                        branch,
                        path,
                    },
                },
            );
            if (!isCurrent(getState, navigationId)) return;
            const result = data.reduce<Record<string, DirectoryItem | FileItem>>((acc, item) => {
                acc[item.name] = {
                    name: item.name,
                    type: item.type === 'tree' || item.type === 'dir' ? 'directory' : 'file',
                    url: item.url,
                };
                return acc;
            }, {});
            dispatch(setList(result));
            dispatch(setVcsRequest({kind: 'list', state: {loading: false, loaded: true}}));
            await updateVcsSettings(dispatch, {path});
        } catch {
            if (isCurrent(getState, navigationId)) {
                dispatch(setListError(true));
                dispatch(setVcsRequest({kind: 'list', state: {loading: false, error: true}}));
            }
        }
    };

const loadFile = async (context: VcsFileContext) => {
    const {data} = await axios.get<{file: string}>('/api/vcs/file', {
        params: {path: context.path, repository: context.repository, branch: context.branch},
        responseType: 'json',
    });
    return data.file;
};

// Legacy callers pass a name. New callers carry the full location, including files
// opened by an explicit path that are not present in the current directory listing.
const resolveFile = (state: RootState, file: string | VcsFileContext) => {
    if (typeof file !== 'string') return file;
    const vcs = selectVcs(state);
    if (vcs.preview.name === file && vcs.preview.context) return vcs.preview.context;
    if (vcs.list[file]?.type !== 'file') return undefined;
    return createVcsFileContext(vcs, joinVcsPath(vcs.path, file));
};

export const openFilePreview =
    (file: string | VcsFileContext): AsyncAction =>
    async (dispatch, getState) => {
        const context = resolveFile(getState(), file);
        if (!context) return;
        const navigationId = selectVcs(getState()).navigationId;
        const requestId = uuidv4();
        dispatch(setPreview({name: context.name, content: '', context}));
        dispatch(setPreviewRequestId(requestId));
        dispatch(setVcsRequest({kind: 'preview', state: {loading: true}}));
        const current = () =>
            isCurrent(getState, navigationId) &&
            selectVcs(getState()).previewRequestId === requestId;
        try {
            const content = await loadFile(context);
            if (!current()) return;
            dispatch(setPreview({name: context.name, content, context}));
            dispatch(setVcsRequest({kind: 'preview', state: {loaded: true}}));
        } catch {
            if (current())
                dispatch(setVcsRequest({kind: 'preview', state: {loading: false, error: true}}));
        }
    };

export const getContentByPath =
    (rawPath: string, navigationId = uuidv4()): AsyncAction =>
    async (dispatch, getState) => {
        dispatch(setNavigationId(navigationId));
        const path = normalizeVcsPath(rawPath);
        if (!path) return dispatch(getRepositoryContent('', navigationId));
        const context = createVcsFileContext(selectVcs(getState()), path);
        if (!context) return;
        dispatch(
            setVcsRequest({kind: 'list', state: {loading: true, loaded: false, error: false}}),
        );
        let content: string;
        try {
            content = await loadFile(context);
        } catch {
            // The API has no stat endpoint. Preserve file-first resolution, then try a directory.
            if (isCurrent(getState, navigationId))
                await dispatch(getRepositoryContent(path, navigationId));
            return;
        }
        if (!isCurrent(getState, navigationId)) return;
        await dispatch(getRepositoryContent(context.directory, navigationId));
        if (!isCurrent(getState, navigationId) || selectVcs(getState()).listError) return;
        const resolved = createVcsFileContext(selectVcs(getState()), path) || context;
        dispatch(setPreview({name: resolved.name, content, context: resolved}));
        dispatch(setVcsRequest({kind: 'preview', state: {loaded: true}}));
        await updateVcsSettings(dispatch, {path});
    };

export const addFileToQuery =
    (file: string | VcsFileContext): AsyncAction =>
    async (dispatch, getState) => {
        const context = resolveFile(getState(), file);
        if (!context || selectVcs(getState()).fileActionRequestId) return;
        const requestId = uuidv4();
        dispatch(setFileActionRequestId(requestId));
        const revision = selectQuerySessionRevision(getState());
        try {
            const content = await wrapApiPromiseByToaster(loadFile(context), {
                skipSuccessToast: true,
                toasterName: 'load-file',
            });
            if (selectQuerySessionRevision(getState()) !== revision) return;
            const state = getState();
            const id = uuidv4();
            dispatch(
                updateQueryDraft({
                    files: [
                        ...selectQueryFiles(state),
                        {
                            id,
                            name: context.name,
                            content,
                            type: 'raw_inline_data',
                        },
                    ],
                }),
            );
            dispatch(setFileEditor({...selectFileEditor(state), isOpen: true, fileId: id}));
            dispatch(setPreview({name: '', content: ''}));
        } catch {
            // loadFile failures are reported by the toaster.
        } finally {
            if (selectVcs(getState()).fileActionRequestId === requestId) {
                dispatch(setFileActionRequestId(''));
            }
        }
    };

export const insertFileToQuery =
    (file: string | VcsFileContext): AsyncAction =>
    async (dispatch, getState) => {
        const context = resolveFile(getState(), file);
        if (!context || selectVcs(getState()).fileActionRequestId) return;
        const requestId = uuidv4();
        dispatch(setFileActionRequestId(requestId));
        const revision = selectQuerySessionRevision(getState());
        try {
            const content = await wrapApiPromiseByToaster(loadFile(context), {
                skipSuccessToast: true,
                toasterName: 'load-file',
            });
            if (selectQuerySessionRevision(getState()) === revision) {
                dispatch(updateQueryDraft({query: content}));
            }
        } catch {
            // loadFile failures are reported by the toaster.
        } finally {
            if (selectVcs(getState()).fileActionRequestId === requestId) {
                dispatch(setFileActionRequestId(''));
            }
        }
    };

export const getFolderContent =
    (name: string): AsyncAction =>
    async (dispatch, getState) => {
        const {list, path} = selectVcs(getState());
        if (list[name]?.type !== 'directory') return;
        await dispatch(getRepositoryContent(joinVcsPath(path, name)));
    };

type RepositorySelection = {branch?: string; path?: string};
export const changeCurrentRepository =
    (
        repositoryName: string,
        navigationId = uuidv4(),
        saved: RepositorySelection = {},
    ): AsyncAction =>
    async (dispatch, getState) => {
        dispatch(setNavigationId(navigationId));
        const repository = selectVcs(getState()).repositories[repositoryName];
        if (!repository) return;
        dispatch(setRepository(repositoryName));
        await updateVcsSettings(dispatch, {repository: repositoryName, branch: '', path: ''});
        if (!isCurrent(getState, navigationId)) return;
        await dispatch(getRepositoryBranches(repositoryName, navigationId));
        if (!isCurrent(getState, navigationId)) return;
        const {branches, requests} = selectVcs(getState());
        if (requests.branches.error) return;
        const values = branches.map((item) => (typeof item === 'string' ? item : item.value));
        let branch = values.includes(repository.defaultBranch)
            ? repository.defaultBranch
            : undefined;
        if (saved.branch && values.includes(saved.branch)) branch = saved.branch;
        dispatch(setBranch(branch));
        await updateVcsSettings(dispatch, {branch});
        if (!branch || !isCurrent(getState, navigationId)) return;
        if (saved.path && saved.branch === branch) {
            await dispatch(getContentByPath(saved.path, navigationId));
        } else {
            await dispatch(getRepositoryContent('', navigationId));
        }
    };

export const getVcsRepositories =
    (
        vcsId?: string,
        navigationId = uuidv4(),
        saved?: RepositorySelection & {repository: string},
    ): AsyncAction =>
    async (dispatch, getState) => {
        dispatch(setNavigationId(navigationId));
        dispatch(setVcs(vcsId));
        if (!vcsId) return;
        dispatch(setVcsRequest({kind: 'repositories', state: {loading: true}}));
        await updateVcsSettings(dispatch, {type: vcsId, repository: '', branch: '', path: ''});
        if (!isCurrent(getState, navigationId)) return;
        try {
            const {data} = await wrapApiPromiseByToaster(
                axios.get<Repositories>('/api/vcs/repositories', {params: {vcsId}}),
                {skipSuccessToast: true, toasterName: 'get-vcs-repositories'},
            );
            if (!isCurrent(getState, navigationId)) return;
            dispatch(setRepositories(data));
            dispatch(setVcsRequest({kind: 'repositories', state: {loading: false, loaded: true}}));
            const keys = Object.keys(data);
            // The library hides a sole repository, so select it even if a saved key disappeared.
            // With multiple repositories, an unavailable saved key leaves the choice to the user.
            let key = keys.length === 1 ? keys[0] : undefined;
            if (saved?.repository && data[saved.repository]) key = saved.repository;
            if (key) {
                await dispatch(
                    changeCurrentRepository(
                        key,
                        navigationId,
                        key === saved?.repository ? saved : undefined,
                    ),
                );
            }
        } catch {
            if (isCurrent(getState, navigationId)) {
                dispatch(
                    setVcsRequest({kind: 'repositories', state: {loading: false, error: true}}),
                );
            }
        }
    };

export const changeCurrentBranch =
    (branch: string): AsyncAction =>
    async (dispatch, getState) => {
        const navigationId = uuidv4();
        dispatch(setNavigationId(navigationId));
        dispatch(setBranch(branch));
        dispatch(setList({}));
        dispatch(setPath(''));
        dispatch(
            setVcsRequest({kind: 'list', state: {loading: false, loaded: false, error: false}}),
        );
        await updateVcsSettings(dispatch, {branch, path: ''});
        if (isCurrent(getState, navigationId))
            await dispatch(getRepositoryContent('', navigationId));
    };

export const setLastVcs = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const type = selectVcsType(state);
    if (!type || !selectVcsConfig(state).some((item) => item.id === type)) return;
    await dispatch(
        getVcsRepositories(type, uuidv4(), {
            repository: selectVcsRepository(state),
            branch: selectVcsBranch(state),
            path: selectVcsPath(state),
        }),
    );
};
