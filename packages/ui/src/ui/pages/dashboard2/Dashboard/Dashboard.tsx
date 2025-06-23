import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit} from '@gravity-ui/dashkit';

import isEqual_ from 'lodash/isEqual';

import {useUsableAccountsQuery} from '../../../store/api/accounts';
import {
    ItemsTypes,
    getEditMode,
    getEdittingConfig,
    openSettingsDialog,
} from '../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';
import {getCluster} from '../../../store/selectors/global';
import {isDeveloper} from '../../../store/selectors/global/is-developer';

import {useDisableMaxContentWidth} from '../../../containers/MaxContentWidth';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

import {WidgetSettings} from './components/WidgetSettings/WidgetSettings';

import {registerPlugins} from './utils/registerPlugins';

configure({lang: Lang.En});

registerPlugins();

export function Dashboard() {
    const dispatch = useDispatch();

    const editMode = useSelector(getEditMode);
    const config = useSelector(getDashboardConfig);
    const edittingConfig = useSelector(getEdittingConfig);
    const cluster = useSelector(getCluster);
    const isAdmin = useSelector(isDeveloper);

    useEffect(() => {
        DashKit.setSettings({
            gridLayout: {
                margin: [8, 8],
            },
        });
    }, []);

    useDisableMaxContentWidth();

    useUsableAccountsQuery({cluster}, {skip: isAdmin});
    const {update} = useDashboardActions();

    const currentConfig = editMode && edittingConfig ? edittingConfig : config;

    return (
        <div style={{margin: '8px'}}>
            <DashKit
                editMode={editMode}
                config={currentConfig}
                onChange={(dash) => {
                    if (!isEqual_(edittingConfig, dash.config)) {
                        update(dash.config);
                    }
                }}
                onItemEdit={(edittingItem) => {
                    dispatch(
                        openSettingsDialog({
                            edittingItem: {
                                ...edittingItem,
                                target: 'editItem',
                                type: edittingItem.type as ItemsTypes,
                            },
                        }),
                    );
                }}
                overlayMenuItems={['settings']}
            />
            <WidgetSettings />
        </div>
    );
}
