import {type RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {selectQueryFiles} from './query';
import {type QueryFile} from '../../../types/query-tracker/api';

export const selectAddForm = (state: RootState) => state.queryTracker.queryFilesModal.addForm;
export const selectFileEditor = (state: RootState) => state.queryTracker.queryFilesModal.fileEditor;
export const selectDeletedFiles = (state: RootState) =>
    state.queryTracker.queryFilesModal.deletedFiles;

export const selectFileEditorConfig = createSelector(
    [selectFileEditor, selectQueryFiles, selectDeletedFiles],
    (fileEditor, files, deletedFiles) => {
        const fileArray = fileEditor.fileType === 'file' ? files : deletedFiles;

        return {
            fileEditor,
            file: fileArray.find((f: QueryFile) => f.id === fileEditor.fileId),
        };
    },
);

export const selectQueryFilesButtonConfig = createSelector(
    [selectQueryFiles, selectDeletedFiles, selectAddForm],
    (files, deletedFiles, addForm) => {
        return {
            files,
            deletedFiles,
            addFormOpen: addForm.isOpen,
            addFormType: addForm.type,
            showTabs: files.length > 0 || deletedFiles.length > 0 || addForm.isOpen,
        };
    },
);
