import React, {FC} from 'react';
import {NodeBlockMeta} from '../canvas/NodeBlock';
import cn from 'bem-cn-lite';
import './DetailBlockTitle.scss';

const block = cn('yt-detailed-block-title');

type Props = {
    icon: NodeBlockMeta['icon'];
    name: string;
};

export const DetailBlockTitle: FC<Props> = ({icon, name}) => {
    return (
        <div className={block()}>
            <img src={icon.src} className={block('icon')} alt="" />
            <div className={block('name')}>{name}</div>
        </div>
    );
};
