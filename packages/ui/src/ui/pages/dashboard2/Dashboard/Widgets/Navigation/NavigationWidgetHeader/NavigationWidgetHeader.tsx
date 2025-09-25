import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useNavigationWidget} from '../hooks/use-navigation-widget';
import type {NavigationWidgetProps} from '../types';

import i18n from '../i18n';

export function NavigationWidgetHeader(props: NavigationWidgetProps) {
    const {items, isLoading} = useNavigationWidget(props);
    const name = props.data?.name;
    const id = props.id;
    return (
        <WidgetHeader
            title={name ?? i18n('title')}
            isLoading={isLoading}
            count={items?.length}
            page={'NAVIGATION'}
            id={id}
        />
    );
}
