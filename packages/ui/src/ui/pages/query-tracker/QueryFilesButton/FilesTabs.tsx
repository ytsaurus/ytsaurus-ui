import React, {FC, useMemo, useState} from 'react';
import {Tabs} from '@gravity-ui/uikit';
import {QueryFile} from '../../../types/query-tracker/api';
import {DeletedFileItem} from './DeletedFileItem';
import cn from 'bem-cn-lite';
import './FilesTabs.scss';
import {FileItem} from './FileItem';
import {FileValidator} from './FileItemForm';
import {QueryFileEditor} from '../../../store/reducers/query-tracker/queryFilesFormSlice';

const block = cn('files-tabs');

enum FileTabs {
    Current = 'current',
    Deleted = 'deleted',
}

type Props = {
    files: QueryFile[];
    deletedFiles: QueryFile[];
    deletedFilesCounter: number;
    className?: string;
    validator: FileValidator;
    onDeleteFile: (id: string) => void;
    onChangeFile: (file: QueryFile) => void;
    onRestoreFile: (id: string) => void;
    onEditFile: (id: string, fileType: QueryFileEditor['fileType']) => void;
};

export const FilesTabs: FC<Props> = ({
    files,
    deletedFiles,
    deletedFilesCounter,
    validator,
    onDeleteFile,
    onChangeFile,
    onRestoreFile,
    onEditFile,
    className,
}) => {
    const [activeTab, setActiveTab] = useState<string>(FileTabs.Current);

    const currentFileItems = useMemo(() => {
        return files.map((file) => (
            <FileItem
                key={file.id}
                file={file}
                onDelete={onDeleteFile}
                onChange={onChangeFile}
                onEditFile={onEditFile}
                validator={validator}
            />
        ));
    }, [files, onDeleteFile, onChangeFile, onEditFile, validator]);

    const deletedFileItems = useMemo(() => {
        return deletedFiles.map((file) => (
            <DeletedFileItem
                key={file.id}
                file={file}
                onRestore={onRestoreFile}
                onEditFile={onEditFile}
            />
        ));
    }, [deletedFiles, onEditFile, onRestoreFile]);

    return (
        <div className={block(null, className)}>
            <Tabs
                activeTab={activeTab}
                items={[
                    {
                        id: FileTabs.Current,
                        title: 'Current',
                        counter: files.length,
                        disabled: !files.length,
                    },
                    {
                        id: FileTabs.Deleted,
                        title: 'Deleted',
                        counter: deletedFilesCounter,
                        disabled: !deletedFilesCounter,
                    },
                ]}
                onSelectTab={setActiveTab}
            />
            <div className={block('list')}>
                {activeTab === FileTabs.Current ? currentFileItems : deletedFileItems}
            </div>
        </div>
    );
};
