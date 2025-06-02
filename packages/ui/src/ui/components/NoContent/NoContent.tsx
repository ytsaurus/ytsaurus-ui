import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Text} from '@gravity-ui/uikit';
import {NotFound} from '@gravity-ui/illustrations';

import './NoContent.scss';

const block = cn('no-content');

interface Props {
    className?: string;
    warning?: string;
    hint?: React.ReactNode;
    padding?: 'large' | 'regular';
    imageSize?: number;
}

export function NoContent({warning, hint, className, padding, imageSize}: Props) {
    return (
        <Flex className={block({padding}, className)} alignItems="center" justifyContent="center">
            <NotFound height={imageSize || 140} width={imageSize || 140} />
            <div className={block('text')}>
                <b className={block('warning')}>{warning}</b>
                <Text variant={'subheader-2'} color={'primary'}>
                    {hint}
                </Text>
            </div>
        </Flex>
    );
}
