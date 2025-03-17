import React from 'react';
import {Text} from '@gravity-ui/uikit';

type Props = {
    engine: string;
};

export function Engine({engine}: Props) {
    return <Text color={'secondary'}>{engine.toUpperCase()}</Text>;
}
