import React, {FC} from 'react';
import {QueriesBlockMeta} from '../QueriesNodeBlock';
import cn from 'bem-cn-lite';
import './DetailBlockTitle.scss';
import {Button, Icon} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

const block = cn('yt-detailed-block-title');

type Props = {
    icon: QueriesBlockMeta['icon'];
    name: string;
    id?: string;
};

export const DetailBlockTitle: FC<Props> = ({icon, name, id}) => {
    let url = '';
    if (id) {
        const [cluster, operationId] = id.split('/');
        url = `/${cluster}/operations/${operationId}`;
    }

    const handleClick = () => {
        window.open(url, '_blank');
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
