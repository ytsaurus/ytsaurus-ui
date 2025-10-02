import React from 'react';

import format from '../../common/hammer/format';

import {Bold, Secondary} from '../../components/Text/Text';
import {Tooltip} from '../../components/Tooltip/Tooltip';

import i18n from './i18n';

export type NumberEditedProps = {
    value?: number;
    editedValue?: number;
};

export function NumberEdited({value, editedValue}: NumberEditedProps) {
    const content = format.Number(value);

    const autoCalculated = isNaN(editedValue!);
    return (
        <Tooltip content={autoCalculated ? i18n('auto-calculated') : i18n('explicitly-defined')}>
            {autoCalculated ? <Secondary>{content}</Secondary> : <Bold>{content}</Bold>}
        </Tooltip>
    );
}
