import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {type Reducer} from 'redux';
import {type VcsConfig, type VcsRepository} from '../../../../shared/vcs';
import {uiSettings} from '../../../config/ui-settings';

export type DirectoryItem = {
    type: 'directory';
    name: string;
    url: string;
};

export type FileItem = {
    type: 'file';
    name: string;
    url: string;
};

export type Repositories = Record<string, VcsRepository>;

export type VcsFileContext = {
    name: string;
    path: string;
    directory: string;
    providerId: string;
    repositoryId: string;
    repository: VcsRepository;
    branch: string;
    sourceUrl?: string;
};

type RequestState = {loading: boolean; loaded: boolean; error: boolean};
export type VcsRequest = 'repositories' | 'branches' | 'list' | 'preview';
const emptyRequest: RequestState = {loading: false, loaded: false, error: false};

export type VcsState = {
    vcsConfig: VcsConfig[] | undefined;
    repositories: Repositories;
    branches: {value: string; text: string}[] | string[];
    list: Record<string, DirectoryItem | FileItem>;
    listFilter: string;
    vcs: string | undefined;
    repository: string | undefined;
    branch: string | undefined;
    path: string;
    preview: {
        name: string;
        content: string;
        context?: VcsFileContext;
    };
    listError: boolean;
    navigationId: string;
    fileActionRequestId: string;
    previewRequestId: string;
    requests: Record<VcsRequest, RequestState>;
};

const getVcsConfig = (): VcsConfig[] | undefined => {
    const {vcsSettings} = uiSettings;

    return vcsSettings?.map((item) => ({...item, hasToken: false}));
};

const initialState: VcsState = {
    vcsConfig: getVcsConfig(),
    list: {},
    listFilter: '',
    repositories: {},
    branches: [],
    vcs: undefined,
    repository: undefined,
    branch: undefined,
    path: '',
    preview: {
        name: '',
        content: '',
    },
    listError: false,
    navigationId: '',
    fileActionRequestId: '',
    previewRequestId: '',
    requests: {
        repositories: {...emptyRequest},
        branches: {...emptyRequest},
        list: {...emptyRequest},
        preview: {...emptyRequest},
    },
};

const vcsSlice = createSlice({
    name: 'vcs',
    initialState,
    reducers: {
        setFileActionRequestId(state, {payload}: PayloadAction<string>) {
            state.fileActionRequestId = payload;
        },
        setNavigationId(state, {payload}: PayloadAction<string>) {
            if (state.navigationId === payload) return;
            state.navigationId = payload;
            state.preview = initialState.preview;
            state.previewRequestId = '';
            for (const request of Object.values(state.requests)) request.loading = false;
            state.requests.preview = {...emptyRequest};
        },
        setPreviewRequestId(state, {payload}: PayloadAction<string>) {
            state.previewRequestId = payload;
        },
        setVcsRequest(
            state,
            {payload}: PayloadAction<{kind: VcsRequest; state: Partial<RequestState>}>,
        ) {
            Object.assign(state.requests[payload.kind], payload.state);
        },
        setVcsTokensAvailability(state, {payload}: PayloadAction<string[]>) {
            const {vcsSettings} = uiSettings;
            if (!vcsSettings) return;

            state.vcsConfig = vcsSettings.map<VcsConfig>((item) => ({
                ...item,
                hasToken: payload.includes(item.id),
            }));
        },
        setVcsConfig(state, {payload}: PayloadAction<VcsConfig[]>) {
            state.vcsConfig = payload;
        },
        setRepositories(state, {payload}: PayloadAction<Repositories>) {
            state.repositories = payload;
        },
        setBranches(state, {payload}: PayloadAction<{value: string; text: string}[] | string[]>) {
            state.branches = payload;
        },
        setVcs(state, {payload}: PayloadAction<string | undefined>) {
            return {
                ...initialState,
                vcsConfig: state.vcsConfig,
                vcs: payload,
                navigationId: state.navigationId,
            };
        },
        setList(state, {payload}: PayloadAction<Record<string, DirectoryItem | FileItem>>) {
            state.list = payload;
        },
        setRepository(state, {payload}: PayloadAction<string | undefined>) {
            return {
                ...state,
                path: initialState.path,
                list: initialState.list,
                branch: payload ? state.repositories[payload]?.defaultBranch : initialState.branch,
                repository: payload,
                branches: [],
                preview: initialState.preview,
                previewRequestId: '',
                listError: false,
                requests: {
                    ...state.requests,
                    branches: {...emptyRequest},
                    list: {...emptyRequest},
                    preview: {...emptyRequest},
                },
            };
        },
        setBranch(state, {payload}: PayloadAction<string | undefined>) {
            state.branch = payload;
        },
        setPath(state, {payload}: PayloadAction<string>) {
            state.path = payload;
        },
        setPreview(state, {payload}: PayloadAction<VcsState['preview']>) {
            state.preview = payload;
            state.previewRequestId = '';
            state.requests.preview = {...emptyRequest};
        },
        setListFilter(state, {payload}: PayloadAction<string>) {
            state.listFilter = payload;
        },
        setListError(state, {payload}: PayloadAction<boolean>) {
            state.listError = payload;
        },
    },
});

export const {
    setFileActionRequestId,
    setNavigationId,
    setPreviewRequestId,
    setVcsRequest,
    setVcsConfig,
    setVcs,
    setPath,
    setRepository,
    setRepositories,
    setBranches,
    setBranch,
    setList,
    setPreview,
    setListFilter,
    setListError,
    setVcsTokensAvailability,
} = vcsSlice.actions;

export const vcsReducer = vcsSlice.reducer as Reducer<VcsState>;
