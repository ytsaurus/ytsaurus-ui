import React, {type FC} from 'react';
import {type QueriesBlockMeta} from '../QueriesNodeBlock';
import cn from 'bem-cn-lite';
import './DetailBlockTitle.scss';
import {Button, Icon} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import {openInNewTab} from '../../../../../utils/utils';
import type {NodeProgress} from '../../models/plan';
import {getOperationPageUrlFromNodeProgress} from '../../services/getOperationPageUrlFromNodeProgress';

const block = cn('yt-detailed-block-title');

type Props = {
    icon: QueriesBlockMeta['icon'];
    name: string;
    nodeProgress?: NodeProgress;
};

export const DetailBlockTitle: FC<Props> = ({icon, name, nodeProgress}) => {
    const url = getOperationPageUrlFromNodeProgress(nodeProgress) ?? '';

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
