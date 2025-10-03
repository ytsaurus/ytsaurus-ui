import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import cn from 'bem-cn-lite';
import {QueryFile} from '../../../types/query-tracker/api';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import clipIcon from '@gravity-ui/icons/svgs/paperclip.svg';
import {VALIDATOR_ERRORS_TEXT} from '../QuerySettingsButton/formValidator';
import './QueryFilesButton.scss';
import {PopupWithCloseButton} from '../QuerySettingsButton/PopupWithCloseButton';
import {ActionsWithAddForm} from './ActionsWithAddForm';
import {FilesTabs} from './FilesTabs';
import {FileValidator, ValidatorError} from './FileItemForm';
import {useDispatch, useSelector} from 'react-redux';
import {
    QueryFileAddForm,
    QueryFileEditor,
    setAddForm,
    setFileEditor,
} from '../../../store/reducers/queries/queryFilesFormSlice';
import {selectQueryFilesButtonConfig} from '../../../store/selectors/queries/queryFilesForm';
import {
    changeQueryFile,
    deleteQueryFile,
    restoreQueryFile,
} from '../../../store/actions/queries/queryFilesForm';
import {updateQueryDraft} from '../../../store/actions/queries/query';

const b = cn('query-files-popup');

type Props = {
    popupClassName?: string;
};

export const QueryFilesButton: FC<Props> = ({popupClassName}) => {
    const dispatch = useDispatch();
    const {files, deletedFiles, addFormOpen, addFormType, showTabs} = useSelector(
        selectQueryFilesButtonConfig,
    );
    const [filesMap, setFilesMap] = useState(new Map<string, QueryFile>());
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);

    useEffect(() => {
        setFilesMap(new Map(files.map((file) => [file.name, file])));
    }, [files]);

    const handleTogglePopup = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);

    const handleChangeFile = useCallback(
        (file: QueryFile) => {
            dispatch(changeQueryFile(file));
        },
        [dispatch],
    );

    const handleDeleteFile = useCallback(
        (id: string) => {
            dispatch(deleteQueryFile(id));
        },
        [dispatch],
    );

    const handleRestoreFile = useCallback(
        (id: string) => {
            dispatch(restoreQueryFile(id));
        },
        [dispatch],
    );

    const handleAddFile = useCallback(
        (file: QueryFile) => {
            dispatch(updateQueryDraft({files: [...files, file]}));
            dispatch(setAddForm({isOpen: false}));
        },
        [dispatch, files],
    );

    const handleToggleAddForm = useCallback(
        (data: QueryFileAddForm) => {
            dispatch(setAddForm(data));
        },
        [dispatch],
    );

    const handleEditFile = useCallback(
        (fileId: string, fileType: QueryFileEditor['fileType']) => {
            dispatch(setFileEditor({fileId, fileType, isOpen: true, isFullWidth: false}));
            setOpen(false);
        },
        [dispatch],
    );

    const validator = useCallback<FileValidator>(
        (oldName, file) => {
            const result: ValidatorError = {};
            if (!file.name) result.name = VALIDATOR_ERRORS_TEXT.NAME_REQUIRED;
            if (filesMap.has(file.name) && oldName !== file.name)
                result.name = VALIDATOR_ERRORS_TEXT.NAME_ALREADY_EXIST;
            if (file.type === 'url' && !file.content)
                result.content = VALIDATOR_ERRORS_TEXT.VALUE_REQUIRED;
            return result;
        },
        [filesMap],
    );

    return (
        <>
            <Button
                ref={btnRef}
                onClick={handleTogglePopup}
                view={open ? 'outlined-info' : 'outlined'}
                selected={open}
                size="l"
            >
                <Icon data={clipIcon} size={16} />
                {files.length > 0 ? ` ${files.length}` : undefined}
            </Button>
            <PopupWithCloseButton
                anchorRef={btnRef}
                open={open}
                onClose={handleTogglePopup}
                className={b(null, popupClassName)}
            >
                <div className={b('header')}>
                    <Text variant="subheader-3">Attachments</Text>
                </div>
                {showTabs && (
                    <FilesTabs
                        className={b('body')}
                        files={files}
                        deletedFiles={deletedFiles}
                        deletedFilesCounter={deletedFiles.length}
                        validator={validator}
                        onDeleteFile={handleDeleteFile}
                        onChangeFile={handleChangeFile}
                        onRestoreFile={handleRestoreFile}
                        onEditFile={handleEditFile}
                    />
                )}
                <ActionsWithAddForm
                    validator={validator}
                    addFormOpen={addFormOpen}
                    addFormType={addFormType}
                    onAddFile={handleAddFile}
                    onFormToggle={handleToggleAddForm}
                />
            </PopupWithCloseButton>
        </>
    );
};
