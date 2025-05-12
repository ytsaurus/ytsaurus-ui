import React from 'react';
import {Text} from '@gravity-ui/uikit';

import hammer from '../../../../../../../common/hammer';

type Props = {
    engine: string;
};

export function Engine({engine}: Props) {
    return (
        <Text color={'secondary'} whiteSpace={'nowrap'}>
            {hammer.format['ReadableField'](engine).toUpperCase()}
        </Text>
    );
}
