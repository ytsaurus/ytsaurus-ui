import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {usePoolsWidget} from '../hooks/use-pools-widget';
import type {PoolsWidgetProps} from '../types';

import i18n from '../i18n';

export function PoolsWidgetHeader(props: PoolsWidgetProps) {
    const {
        data: {pools, isLoading},
    } = usePoolsWidget(props);
    const name = props.data?.name;
    const id = props.id;
    return (
        <WidgetHeader
            title={name ?? i18n('title')}
            count={pools?.length}
            isLoading={isLoading}
            page={'SCHEDULING'}
            id={id}
        />
    );
}
