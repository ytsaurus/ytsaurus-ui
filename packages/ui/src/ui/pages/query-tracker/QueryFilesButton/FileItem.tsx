import React, {FC, useState} from 'react';
import cn from 'bem-cn-lite';
import './FileItem.scss';
import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import PencilToSquareIcon from '@gravity-ui/icons/svgs/pencil-to-square.svg';
import {FileItemForm, FileValidator} from './FileItemForm';
import {QueryFile} from '../../../types/query-tracker/api';
import {QueryFileEditor} from '../../../store/reducers/queries/queryFilesFormSlice';

const block = cn('file-item');

type Props = {
    file: QueryFile;
    onDelete: (id: string) => void;
    onChange: (data: QueryFile) => void;
    onEditFile: (id: string, fileType: QueryFileEditor['fileType']) => void;
    validator: FileValidator;
};

export const FileItem: FC<Props> = ({file, validator, onChange, onEditFile, onDelete}) => {
    const [edit, setEdit] = useState(false);
    const {id, name, content, type} = file;
    const isFile = type === 'raw_inline_data';

    const handleDelete = () => {
        onDelete(id);
    };

    const handleToggleEdit = () => {
        setEdit((prevState) => !prevState);
    };

    const handleChange = (data: QueryFile) => {
        onChange(data);
        setEdit(false);
    };

    const handleFileEdit = () => {
        onEditFile(id, 'file');
    };

    if (edit) {
        return (
            <div className={block({edit: true})}>
                <FileItemForm
                    file={file}
                    onSave={handleChange}
                    onCancel={handleToggleEdit}
                    validator={validator}
                />
            </div>
        );
    }

    return (
        <div className={block()}>
            <div className={block('info')}>
                <Icon className={block('icon')} data={isFile ? FileIcon : LinkIcon} size={16} />
                <Text variant="subheader-2" ellipsis>
                    {name}
                </Text>
                {!isFile && (
                    <Text variant="subheader-2" ellipsis>
                        {content}
                    </Text>
                )}
            </div>

            <div className={block('actions')}>
                {isFile && (
                    <Tooltip content="Edit file" placement="top">
                        <Button onClick={handleFileEdit} view="flat" size="l">
                            <Icon data={PencilToSquareIcon} size={16} />
                        </Button>
                    </Tooltip>
                )}
                <Tooltip content="Edit file name" placement="top">
                    <Button onClick={handleToggleEdit} view="flat" size="l">
                        <Icon data={PencilIcon} size={16} />
                    </Button>
                </Tooltip>

                <Tooltip content="Remove" placement="top">
                    <Button onClick={handleDelete} view="flat" size="l">
                        <Icon data={TrashBinIcon} size={16} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};
