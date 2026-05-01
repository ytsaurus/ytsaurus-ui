import React from 'react';

import {WidgetText} from '../../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';
import {type QueryEngine} from '../../types';
import i18n from '../../i18n';

type Props = {
    engine: QueryEngine;
};

export function Engine({engine}: Props) {
    return <WidgetText color={'secondary'}>{i18n(`value_${engine}`)}</WidgetText>;
}
