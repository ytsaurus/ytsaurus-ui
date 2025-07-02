import React from 'react';

import hammer from '../../../../../../../common/hammer';

import {WidgetText} from '../../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

type Props = {
    engine: string;
};

export function Engine({engine}: Props) {
    return (
        <WidgetText color={'secondary'}>
            {hammer.format['ReadableField'](engine).toUpperCase()}
        </WidgetText>
    );
}
