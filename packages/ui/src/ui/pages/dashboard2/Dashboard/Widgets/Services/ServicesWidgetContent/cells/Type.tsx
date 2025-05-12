import React from 'react';
import {Label} from '@gravity-ui/uikit';

type Props = {
    type: string;
};

export function Type({type}: Props) {
    return <Label>{type}</Label>;
}
