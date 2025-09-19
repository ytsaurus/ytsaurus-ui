import React from 'react';
import {Label} from '@gravity-ui/uikit';
import format from '../../../../../../../common/hammer/format';

type Props = {
    type?: string;
};

export function Type({type}: Props) {
    if (!type) {
        return format.NO_VALUE;
    }
    return <Label>{type}</Label>;
}
