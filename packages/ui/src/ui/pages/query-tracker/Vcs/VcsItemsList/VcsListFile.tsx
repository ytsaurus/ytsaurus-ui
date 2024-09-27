import React, {FC} from 'react';
import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import cn from 'bem-cn-lite';
import './VcsListFile.scss';
import {ClickableText} from '../../../../components/ClickableText/ClickableText';

const block = cn('vcs-list-file');

type Props = {
    name: string;
    url: string;
    onAddFile: (name: string) => void;
    onInsertFile: (name: string) => void;
    onShowClick: (name: string) => void;
};

export const VcsListFile: FC<Props> = ({name, url, onAddFile, onInsertFile, onShowClick}) => {
    const handleAddClick = () => {
        onAddFile(name);
    };

    const handleShowClick = () => {
        onShowClick(name);
    };

    const handleInsertClick = () => {
        onInsertFile(name);
    };

    return (
        <div className={block()}>
            <ClickableText className={block('link')} onClick={handleShowClick} color="primary">
                <Icon className={block('linkIcon')} data={FileTextIcon} size={16} />{' '}
                <Text ellipsis>{name}</Text>
            </ClickableText>
            <div className={block('side')}>
                <Tooltip content="Insert into editor">
                    <Button view="flat" onClick={handleInsertClick}>
                        <Icon data={TextIndentIcon} size={16} />
                    </Button>
                </Tooltip>
                <Tooltip content="Open in source">
                    <Button view="flat" href={url} target="_blank">
                        <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                    </Button>
                </Tooltip>
                <Tooltip content="Attach file to query">
                    <Button view="flat" onClick={handleAddClick}>
                        <Icon data={FilePlusIcon} size={16} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};
