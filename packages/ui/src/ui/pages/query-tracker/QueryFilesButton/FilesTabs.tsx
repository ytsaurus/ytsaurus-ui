import React, {FC, useMemo} from 'react';
import {Tabs} from '@gravity-ui/uikit';
import {SettingsItem} from '../QuerySettingsButton/SettingsItem';
import {QueryFile} from '../module/api';
import {
    SaveFormData,
    Props as SettingsItemEditFormProps,
} from '../QuerySettingsButton/SettingsItemForm';
import {DeletedFileItem} from './DeletedFileItem';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import cn from 'bem-cn-lite';
import './FilesTabs.scss';

const block = cn('files-tabs');

enum FileTabs {
    Current = 'current',
    Deleted = 'deleted',
}

type Props = {
    activeTab: FileTabs;
    files: QueryFile[];
    filesCounter: number;
    deletedFiles: QueryFile[];
    deletedFilesCounter: number;
    className?: string;
    validator: SettingsItemEditFormProps['validator'];
    onTabChange: (tabId: FileTabs) => void;
    onDeleteFile: (name: string) => void;
    onChangeFile: (data: SaveFormData) => void;
    onRestoreFile: (name: string) => void;
};

export const FilesTabs: FC<Props> = ({
    activeTab,
    files,
    deletedFiles,
    filesCounter,
    deletedFilesCounter,
    validator,
    onTabChange,
    onDeleteFile,
    onChangeFile,
    onRestoreFile,
    className,
}) => {
    const currentFileItems = useMemo(() => {
        return files.map((file) => (
            <SettingsItem
                key={file.name}
                icon={FileIcon}
                name={file.name}
                value={file.content}
                onDelete={onDeleteFile}
                onChange={onChangeFile}
                validator={validator}
                canEdit={{name: true, value: file.type === 'url'}}
            />
        ));
    }, [files, onDeleteFile, onChangeFile, validator]);

    const deletedFileItems = useMemo(() => {
        return deletedFiles.map((file, i) => (
            <DeletedFileItem key={`${file.name}-${i}`} name={file.name} onRestore={onRestoreFile} />
        ));
    }, [deletedFiles, onRestoreFile]);

    return (
        <div className={block(null, className)}>
            <Tabs
                activeTab={activeTab}
                items={[
                    {
                        id: FileTabs.Current,
                        title: 'Current',
                        counter: filesCounter,
                        disabled: !filesCounter,
                    },
                    {
                        id: FileTabs.Deleted,
                        title: 'Deleted',
                        counter: deletedFilesCounter,
                        disabled: !deletedFilesCounter,
                    },
                ]}
                onSelectTab={onTabChange}
            />
            <div className={block('list')}>
                {activeTab === FileTabs.Current ? currentFileItems : deletedFileItems}
            </div>
        </div>
    );
};
