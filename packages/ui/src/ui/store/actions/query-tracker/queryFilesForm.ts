import {type QueryFile} from './api';
import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../reducers';
import {type Action} from 'redux';
import {selectQueryFiles} from '../../selectors/query-tracker/query';
import {SET_QUERY_FILES} from '../../reducers/query-tracker/query-tracker-contants';
import isEqual_ from 'lodash/isEqual';
import {selectDeletedFiles} from '../../selectors/query-tracker/queryFilesForm';
import {toaster} from '../../../utils/toaster';
import i18n from '../../../pages/query-tracker/QuerySettingsButton/helpers/i18n';

export const applyQueryFiles =
    (
        files: QueryFile[],
        deletedFiles: QueryFile[],
    ): ThunkAction<boolean, RootState, undefined, Action> =>
    (dispatch, getState) => {
        if (new Set(files.map(({name}) => name)).size !== files.length) {
            toaster.add({
                name: 'query_file_name_conflict',
                theme: 'danger',
                title: i18n('alert_name-already-exist'),
                autoHiding: false,
            });
            return false;
        }
        const state = getState();
        if (
            !isEqual_(files, selectQueryFiles(state)) ||
            !isEqual_(deletedFiles, selectDeletedFiles(state))
        ) {
            dispatch({type: SET_QUERY_FILES, data: {files, deletedFiles}});
        }
        return true;
    };

export const addQueryFile =
    (file: QueryFile): ThunkAction<boolean, RootState, undefined, Action> =>
    (dispatch, getState) =>
        dispatch(
            applyQueryFiles(
                [...selectQueryFiles(getState()), file],
                selectDeletedFiles(getState()),
            ),
        );

const findObjectByTitle = <T>(arr: T[], callback: (i: T) => boolean): [T, T[]] | null => {
    const index = arr.findIndex(callback);
    if (index < 0) return null;

    const foundObject = arr[index];
    const remainingObjects = [...arr.slice(0, index), ...arr.slice(index + 1)];
    return [foundObject, remainingObjects];
};

export const changeQueryFile =
    (file: QueryFile): ThunkAction<void, RootState, undefined, Action> =>
    (dispatch, getState) => {
        const state = getState();
        const files = selectQueryFiles(state);
        const index = files.findIndex((f) => f.id === file.id);
        if (index < 0) return;

        const newFiles = [...files];
        newFiles[index] = file;

        dispatch(applyQueryFiles(newFiles, selectDeletedFiles(state)));
    };

export const restoreQueryFile =
    (id: string): ThunkAction<void, RootState, undefined, Action> =>
    (dispatch, getState) => {
        const state = getState();
        const deletedFiles = selectDeletedFiles(state);
        const files = selectQueryFiles(state);

        const data = findObjectByTitle<QueryFile>(deletedFiles, (file) => file.id === id);
        if (data === null) return;
        const [restoreFile, deletedList] = data;

        dispatch(applyQueryFiles([...files, restoreFile], deletedList));
    };

export const deleteQueryFile =
    (id: string): ThunkAction<void, RootState, undefined, Action> =>
    (dispatch, getState) => {
        const state = getState();
        const deletedFiles = selectDeletedFiles(state);
        const files = selectQueryFiles(state);

        const data = findObjectByTitle<QueryFile>(files, (file) => file.id === id);
        if (data === null) return;
        const [deletedFile, fileList] = data;

        dispatch(applyQueryFiles(fileList, [...deletedFiles, deletedFile]));
    };
