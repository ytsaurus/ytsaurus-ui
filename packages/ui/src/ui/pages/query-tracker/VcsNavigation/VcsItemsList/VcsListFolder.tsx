import React, {FC} from 'react';
import {Icon, Link, Text} from '@gravity-ui/uikit';
import FolderIcon from '@gravity-ui/icons/svgs/folder.svg';
import cn from 'bem-cn-lite';
import './VcsListFolder.scss';

const block = cn('vcs-list-folder');

type Props = {
    name: string;
    onClick: (name: string) => void;
};

export const VcsListFolder: FC<Props> = ({name, onClick}) => {
    const handleClick = () => {
        onClick(name);
    };

    return (
        <Link onClick={handleClick} className={block()} view="primary">
            <Icon className={block('icon')} data={FolderIcon} size={16} />{' '}
            <Text ellipsis>{name}</Text>
        </Link>
    );
};
