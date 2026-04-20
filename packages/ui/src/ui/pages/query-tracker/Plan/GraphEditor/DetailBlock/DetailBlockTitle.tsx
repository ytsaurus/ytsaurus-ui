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
    id?: string;
};

export const DetailBlockTitle: FC<Props> = ({icon, name, id}) => {
    let url = '';
    if (id) {
        const [cluster, operationId] = id.split('/');
        const clusterName = cluster?.split('.')[0] ?? cluster;
        url = `/${clusterName}/operations/${encodeURIComponent(operationId ?? '')}`;
    }

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
