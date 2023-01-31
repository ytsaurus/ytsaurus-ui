import React, {ReactNode} from 'react';
import block from 'bem-cn-lite';
import {Icon} from '@gravity-ui/uikit';

import infoIcon from '../../../../img/svg/info-icon2.svg';

import './Info.scss';

const b = block('info-block');

interface InfoProps {
    children: ReactNode;
    className?: string;
}
export function Info({children, className}: InfoProps) {
    return (
        <div className={b(null, className)}>
            <div className={b('icon')}>
                <Icon data={infoIcon} />
            </div>
            <div className={b('body')}>{children}</div>
        </div>
    );
}
