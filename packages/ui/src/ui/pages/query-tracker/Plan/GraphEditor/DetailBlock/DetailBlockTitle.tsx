import React, {type FC} from 'react';
import {type QueriesBlockMeta} from '../QueriesNodeBlock';
import cn from 'bem-cn-lite';
import './DetailBlockTitle.scss';
import {Button, Icon} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import {openInNewTab} from '../../../../../utils/utils';

const block = cn('yt-detailed-block-title');

type Props = {
    icon: QueriesBlockMeta['icon'];
    name: string;
    operationUrl?: string;
};

export const DetailBlockTitle: FC<Props> = ({icon, name, operationUrl}) => {
    const url = operationUrl ?? '';

    const handleClick = () => {
        openInNewTab(url);
    };

    return (
        <div className={block()}>
            <img src={icon.src} className={block('icon')} alt="" />
            <div className={block('name')}>{name}</div>
            {Boolean(url) && (
                <Button target="_blank" className={block('link')} onClick={handleClick} view="flat">
                    <Icon data={ArrowUpRightFromSquare} size={16} />
                </Button>
            )}
        </div>
    );
};
