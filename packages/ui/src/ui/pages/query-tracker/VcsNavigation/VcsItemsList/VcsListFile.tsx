import React, {FC} from 'react';
import {Button, Icon, Link, Text} from '@gravity-ui/uikit';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import cn from 'bem-cn-lite';
import './VcsListFile.scss';

const block = cn('vcs-list-file');

type Props = {
    name: string;
    url: string;
    onAddFile: (name: string) => void;
    onShowClick: (name: string) => void;
};

export const VcsListFile: FC<Props> = ({name, url, onAddFile, onShowClick}) => {
    const handleAddClick = () => {
        onAddFile(name);
    };

    const handleShowClick = () => {
        onShowClick(name);
    };

    return (
        <div className={block()}>
            <Link className={block('link')} onClick={handleShowClick} view="primary">
                <Icon className={block('linkIcon')} data={FileTextIcon} size={16} />{' '}
                <Text ellipsis>{name}</Text>
            </Link>
            <div className={block('side')}>
                <Button view="flat" href={url} target="_blank">
                    <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                </Button>
                <Button view="flat" onClick={handleAddClick}>
                    <Icon data={FilePlusIcon} size={16} />
                </Button>
            </div>
        </div>
    );
};
