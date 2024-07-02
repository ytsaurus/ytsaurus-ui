import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {GithubRepository, GitlabRepository, VcsConfig} from '../../../../../shared/vcs';

export type DirectoryItem = {
    type: 'directory';
    name: string;
};

export type FileItem = {
    type: 'file';
    name: string;
};

export type Repositories = Record<string, GithubRepository> | Record<string, GitlabRepository>;

export type RepoNavigationState = {
    vcsConfig: VcsConfig[];
    repositories: Repositories;
    branches: string[];
    list: Record<string, DirectoryItem | FileItem>;
    vcs: string | undefined;
    repository: string | undefined;
    branch: string | undefined;
    path: string;
    preview: {
        name: string;
        content: string;
    };
};

const initialState: RepoNavigationState = {
    vcsConfig: [],
    list: {},
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
};

const repoNavigationSlice = createSlice({
    name: 'repoNavigation',
    initialState,
    reducers: {
        setVcsConfig(state, {payload}: PayloadAction<VcsConfig[]>) {
            state.vcsConfig = payload;
        },
        setRepositories(state, {payload}: PayloadAction<Repositories>) {
            state.repositories = payload;
        },
        setBranches(state, {payload}: PayloadAction<string[]>) {
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
        setPreview(state, {payload}: PayloadAction<RepoNavigationState['preview']>) {
            state.preview = payload;
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
} = repoNavigationSlice.actions;

export const repoNavigationReducer = repoNavigationSlice.reducer as Reducer<RepoNavigationState>;
