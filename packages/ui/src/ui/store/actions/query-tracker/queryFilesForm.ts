import {QueryFile} from './api';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';
import {getQueryFiles} from '../../selectors/query-tracker/query';
import {updateQueryDraft} from './query';
import {setDeletedFiles} from '../../reducers/query-tracker/queryFilesFormSlice';
import {selectDeletedFiles} from '../../selectors/query-tracker/queryFilesForm';
import {toaster} from '../../../utils/toaster';

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
        const files = getQueryFiles(state);
        const index = files.findIndex((f) => f.id === file.id);
        if (index < 0) return;

        const newFiles = [...files];
        newFiles[index] = file;

        dispatch(updateQueryDraft({files: newFiles}));
    };

export const restoreQueryFile =
    (id: string): ThunkAction<void, RootState, undefined, Action> =>
    (dispatch, getState) => {
        const state = getState();
        const deletedFiles = selectDeletedFiles(state);
        const files = getQueryFiles(state);

        const data = findObjectByTitle<QueryFile>(deletedFiles, (file) => file.id === id);
        if (data === null) return;
        const [restoreFile, deletedList] = data;

        if (files.some((file) => file.name === restoreFile.name)) {
            toaster.add({
                name: 'restore_query_file',
                theme: 'danger',
                title: 'The file could not be restored. The file name already exists in the list of active files.',
                autoHiding: false,
            });
            return;
        }

        dispatch(updateQueryDraft({files: [...files, restoreFile]}));
        dispatch(setDeletedFiles(deletedList));
    };

export const deleteQueryFile =
    (id: string): ThunkAction<void, RootState, undefined, Action> =>
    (dispatch, getState) => {
        const state = getState();
        const deletedFiles = selectDeletedFiles(state);
        const files = getQueryFiles(state);

        const data = findObjectByTitle<QueryFile>(files, (file) => file.id === id);
        if (data === null) return;
        const [deletedFile, fileList] = data;

        dispatch(updateQueryDraft({files: fileList}));
        dispatch(setDeletedFiles([...deletedFiles, deletedFile]));
    };
