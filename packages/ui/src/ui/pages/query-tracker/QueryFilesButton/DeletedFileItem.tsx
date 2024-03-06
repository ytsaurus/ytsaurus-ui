import React, {FC} from 'react';
import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import ArrowRotateRightIcon from '@gravity-ui/icons/svgs/arrow-rotate-right.svg';
import cn from 'bem-cn-lite';
import './DeletedFileItem.scss';

const block = cn('deleted-file-item');

type Props = {
    name: string;
    onRestore: (name: string) => void;
};

export const DeletedFileItem: FC<Props> = ({name, onRestore}) => {
    const handleRestoreFile = () => {
        onRestore(name);
    };

    return (
        <div className={block()}>
            <div className={block('info')}>
                <Icon data={FileIcon} size={16} />
                <Text variant="subheader-2" ellipsis>
                    {name}
                </Text>
            </div>
            <Tooltip content="Restore" placement="top">
                <Button onClick={handleRestoreFile} view="flat" size="l">
                    <Icon data={ArrowRotateRightIcon} size={16} />
                </Button>
            </Tooltip>
        </div>
    );
};
