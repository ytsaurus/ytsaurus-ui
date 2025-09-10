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
            <Flex className={block('text')} direction={'column'} gap={2}>
                <Text variant={'subheader-3'}>{warning}</Text>
                <Text variant={'inherit'} color={'secondary'}>
                    {hint}
                </Text>
            </Flex>
        </Flex>
    );
}
