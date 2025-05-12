import React from 'react';
import {Label} from '@gravity-ui/uikit';

type Props = {
    duration: string;
};

export function Duration({duration}: Props) {
    return <Label>{duration}</Label>;
}
