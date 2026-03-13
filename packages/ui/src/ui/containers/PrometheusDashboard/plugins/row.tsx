import React from 'react';
import {PrometheusPlugins} from '../PrometheusDashKit';
import {ExpandButton} from '../../../components/ExpandButton';
import {Secondary} from '../../../components/Text/Text';
import i18n from './i18n';

export const renderPluginRow: PrometheusPlugins['row']['renderer'] = (
    {data, ...props},
    elementRef,
) => {
    const {collapsed, onToggleCollapsed, childCount} = data;
    return (
        <div ref={elementRef} key={props.id}>
            <ExpandButton expanded={!collapsed} toggleExpanded={onToggleCollapsed} />
            {collapsed && <Secondary>{childCount} {i18n('value_panels')}</Secondary>}
        </div>
    );
};
