import React from 'react';
import cn from 'bem-cn-lite';

// @ts-ignore
import NoContentImage from '../../../../img/svg/no-content.svg';

import './NoContent.scss';

const block = cn('no-content');

interface Props {
    className?: string;
    warning?: string;
    hint?: React.ReactNode;
}

export function NoContent({warning, hint, className}: Props) {
    return (
        <div className={block(null, className)}>
            <NoContentImage className={block('image')} />
            <b className={block('warning')}>{warning}</b>
            <p>{hint}</p>
        </div>
    );
}
