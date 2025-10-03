import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const SettingsPanelLazy = withLazyLoading(
    React.lazy(
        async () => await import(/* webpackChunkName: "settings-panel" */ './SettingsPanel'),
    ),
);
