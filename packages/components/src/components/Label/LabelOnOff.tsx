import React from 'react';

import {Label} from './Label';
import {format} from '../../utils/hammer';
import i18n from './i18n';

export function LabelOnOff({value, className}: {value?: boolean; className?: string}) {
    if (value === undefined) {
        return format.NO_VALUE;
    }
    const theme = value ? 'success' : 'danger';
    const text = value ? i18n('value_on') : i18n('value_off');
    return <Label theme={theme} text={text} className={className} />;
}
