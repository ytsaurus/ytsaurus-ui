import React, {FC} from 'react';
import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import ArrowRotateRightIcon from '@gravity-ui/icons/svgs/arrow-rotate-right.svg';
import cn from 'bem-cn-lite';
import './DeletedFileItem.scss';
import {QueryFile} from '../../../types/query-tracker/api';
import PencilToSquareIcon from '@gravity-ui/icons/svgs/pencil-to-square.svg';
import {QueryFileEditor} from '../../../store/reducers/queries/queryFilesFormSlice';

const block = cn('deleted-file-item');

type Props = {
    file: QueryFile;
    onEditFile: (id: string, fileType: QueryFileEditor['fileType']) => void;
    onRestore: (id: string) => void;
};

export const DeletedFileItem: FC<Props> = ({file, onEditFile, onRestore}) => {
    const isFile = file.type === 'raw_inline_data';

    const handleFileEdit = () => {
        onEditFile(file.id, 'deletedFile');
    };
    const handleRestoreFile = () => {
        onRestore(file.id);
    };

    return (
        <div className={block()}>
            <div className={block('info')}>
                <Icon data={isFile ? FileIcon : LinkIcon} size={16} />
                <Text variant="subheader-2" ellipsis>
                    {file.name}
                </Text>
            </div>

            <div className={block('actions')}>
                {isFile && (
                    <Tooltip content="Edit file" placement="top">
                        <Button onClick={handleFileEdit} view="flat" size="l">
                            <Icon data={PencilToSquareIcon} size={16} />
                        </Button>
                    </Tooltip>
                )}
                <Tooltip content="Restore" placement="top">
                    <Button onClick={handleRestoreFile} view="flat" size="l">
                        <Icon data={ArrowRotateRightIcon} size={16} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};
