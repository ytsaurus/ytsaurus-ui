import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import cn from 'bem-cn-lite';
import {QueryFile} from '../module/api';
import {Button, Icon, Text, Toaster} from '@gravity-ui/uikit';
import clipIcon from '@gravity-ui/icons/svgs/paperclip.svg';
import {VALIDATOR_ERRORS_TEXT, formValidator} from '../QuerySettingsButton/formValidator';
import './QueryFilesButton.scss';
import {PopupWithCloseButton} from '../QuerySettingsButton/PopupWithCloseButton';
import {FilesAddForm} from './FilesAddForm';
import {
    SaveFormData,
    Props as SettingsItemEditFormProps,
} from '../QuerySettingsButton/SettingsItemForm';
import {setAccountLimit} from '../../../utils/accounts/editor';
import {FilesTabs} from './FilesTabs';

const b = cn('query-files-popup');
const toaster = new Toaster();

enum FileTabs {
    Current = 'current',
    Deleted = 'deleted',
}

type Props = {
    files: QueryFile[];
    queryId: string;
    onChange: (files: QueryFile[]) => void;
};

export const QueryFilesButton: FC<Props> = ({files, onChange}) => {
    const [filesMap, setFilesMap] = useState(new Map<string, QueryFile>());
    const [deletedFiles, setDeletedFiles] = useState<QueryFile[]>([]);
    const [open, setOpen] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(FileTabs.Current);
    const btnRef = useRef(null);

    useEffect(() => {
        setFilesMap(new Map(files.map((file) => [file.name, file])));
    }, [files]);

    const handleTogglePopup = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);

    const handleToggleForm = useCallback(() => {
        setFormVisible((prevState) => !prevState);
        setActiveTab(FileTabs.Current);
    }, []);

    const handleAddFile = useCallback(
        (file: QueryFile) => {
            onChange([...files, file]);
            setFormVisible(false);
        },
        [files, onChange],
    );

    const handleEditFile = useCallback(
        ({name, value, oldName}: SaveFormData) => {
            const file = filesMap.get(oldName);
            if (!file) return;
            file.name = name;
            file.content = value;

            onChange([...filesMap].map(([_, val]) => val));
        },
        [filesMap, onChange],
    );

    const handleDeleteFile = useCallback(
        (name: string) => {
            const file = filesMap.get(name);
            if (!file) return;

            setDeletedFiles([...deletedFiles, file]);
            const newFilesList = files.filter((i) => i.name !== name);
            if (!newFilesList.length) setAccountLimit(FileTabs.Deleted);
            onChange(newFilesList);
        },
        [deletedFiles, files, filesMap, onChange],
    );

    const handleRestoreFile = useCallback(
        (name: string) => {
            if (filesMap.has(name)) {
                toaster.add({
                    name: 'restore_query_file',
                    type: 'error',
                    title: 'The file could not be restored. The file name already exists in the list of active files.',
                    autoHiding: false,
                });
                return;
            }

            const [file, newDeletedFiles] = deletedFiles.reduce<[null | QueryFile, QueryFile[]]>(
                (acc, item) => {
                    if (item.name === name) {
                        acc[0] = item;
                    } else {
                        acc[1].push(item);
                    }
                    return acc;
                },
                [null, []],
            );

            setDeletedFiles(newDeletedFiles);
            if (file) {
                onChange([...files, file]);
            }
        },
        [deletedFiles, files, filesMap, onChange],
    );

    const validator = useCallback<SettingsItemEditFormProps['validator']>(
        (oldName, name, value) => {
            const result = formValidator(name, value);
            if (filesMap.has(name)) {
                if (oldName === name) return result;
                result.name = VALIDATOR_ERRORS_TEXT.NAME_ALREADY_EXIST;
            }
            return result;
        },
        [filesMap],
    );

    const showTabs = files.length > 0 || deletedFiles.length > 0 || formVisible;

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
            </Button>
            <PopupWithCloseButton
                anchorRef={btnRef}
                open={open}
                onClose={handleTogglePopup}
                className={b()}
            >
                <div className={b('header')}>
                    <Text variant="subheader-3">Attachments</Text>
                </div>
                {showTabs && (
                    <FilesTabs
                        className={b('body')}
                        activeTab={activeTab}
                        files={files}
                        filesCounter={formVisible ? files.length + 1 : files.length}
                        deletedFiles={deletedFiles}
                        deletedFilesCounter={deletedFiles.length}
                        validator={validator}
                        onTabChange={setActiveTab}
                        onDeleteFile={handleDeleteFile}
                        onChangeFile={handleEditFile}
                        onRestoreFile={handleRestoreFile}
                    />
                )}
                <FilesAddForm
                    onAddFile={handleAddFile}
                    validator={validator}
                    formVisible={formVisible}
                    toggleForm={handleToggleForm}
                />
            </PopupWithCloseButton>
        </>
    );
};
