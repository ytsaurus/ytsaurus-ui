import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {GithubRepository, GitlabRepository, VcsConfig} from '../../../../shared/vcs';
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

export type Repositories = Record<string, GithubRepository> | Record<string, GitlabRepository>;

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
    };
    listError: boolean;
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
};

const vcsSlice = createSlice({
    name: 'vcs',
    initialState,
    reducers: {
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
                branch: payload ? state.repositories[payload].defaultBranch : initialState.branch,
                repository: payload,
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
