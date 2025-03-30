import React from 'react';
import {PrometheusPlugins} from '../PrometheusDashKit';
import {ExpandButton} from '../../../components/ExpandButton';
import {Secondary} from '../../../components/Text/Text';

export const renderPluginRow: PrometheusPlugins['row']['renderer'] = ({data}, elementRef) => {
    const {collapsed, onToggleCollapsed, childCount} = data;
    return (
        <div ref={elementRef}>
            <ExpandButton expanded={!collapsed} toggleExpanded={onToggleCollapsed} />
            {collapsed && <Secondary>{childCount} panels</Secondary>}
        </div>
    );
};
