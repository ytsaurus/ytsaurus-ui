import React from 'react';

import format from '../../../../../../../common/hammer/format';

import {WidgetText} from '../../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

type Props = {
    engine: string;
};

export function Engine({engine}: Props) {
    return (
        <WidgetText color={'secondary'}>{format.ReadableField(engine).toUpperCase()}</WidgetText>
    );
}
