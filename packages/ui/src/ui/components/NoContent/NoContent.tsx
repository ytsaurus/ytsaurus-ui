import React from 'react';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

// @ts-ignore
import NoContentImage from '../../../../img/svg/no-content.svg';

import './NoContent.scss';

const block = cn('no-content');

interface Props {
    className?: string;
    warning?: string;
    hint?: React.ReactNode;
    padding?: 'large' | 'regular';
}

export function NoContent({warning, hint, className, padding}: Props) {
    return (
        <Flex className={block({padding}, className)} alignItems="center" justifyContent="center">
            <div className={block('image')}>
                <NoContentImage className={block('image')} />
            </div>
            <div className={block('text')}>
                <b className={block('warning')}>{warning}</b>
                <p>{hint}</p>
            </div>
        </Flex>
    );
}
