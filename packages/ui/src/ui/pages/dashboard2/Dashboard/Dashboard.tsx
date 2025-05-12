import React from 'react';
import {useSelector} from 'react-redux';
import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, ItemDropProps} from '@gravity-ui/dashkit';

import {getEditMode} from '../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';

import {useDisableMaxContentWidth} from '../../../containers/MaxContentWidth';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

import {WidgetSettings} from './components/WidgetSettings/WidgetSettings';

import {registerPlugins} from './utils/registerPlugins';

configure({lang: Lang.En});

DashKit.setSettings({
    gridLayout: {
        margin: [8, 8],
    },
});

export function Dashboard() {
    const editMode = useSelector(getEditMode);
    const config = useSelector(getDashboardConfig);

    useDisableMaxContentWidth();

    useUsableAccountsQuery(undefined, {skip: isAdmin});
    const {update} = useDashboardActions();

    const onDrop = (dropProps: ItemDropProps) => {
        dropProps.commit();
    };

    return (
        <div style={{margin: '8px'}}>
            <DashKit
                editMode={editMode}
                config={config}
                onChange={(dash) => {
                    update(dash.config);
                }}
                onDrop={onDrop}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        </div>
    );
}
