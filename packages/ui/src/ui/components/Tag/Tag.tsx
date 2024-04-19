import React from 'react';
import cn from 'bem-cn-lite';

import {Icon} from '@gravity-ui/uikit';

import closeIcon from '../../assets/img/svg/close-icon.svg';
import './Tag.scss';

const block = cn('yt-tag');

export interface TagProps {
    asUsername?: boolean;
    text: string;
    onRemove?: () => void;
}

export default function Tag(props: TagProps) {
    const {text, onRemove, asUsername} = props;

    return (
        <div className={block()}>
            <div className={block('text', {['as-user']: asUsername})}>{text}</div>
            {onRemove && (
                <div className={block('remove')} onClick={onRemove}>
                    <Icon data={closeIcon} width={20} height={20} />
                </div>
            )}
        </div>
    );
}
