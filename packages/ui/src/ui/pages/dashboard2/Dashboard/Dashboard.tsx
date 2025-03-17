import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, DashKitDnDWrapper, ItemDropProps} from '@gravity-ui/dashkit';

import {registerPlugins} from './utils/registerPlugins';
import {editItem, selectEditMode} from '../../../store/reducers/dashboard2/dashboard';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

import {useUpdateDashboard} from '../hooks/use-update-dashboard';
import {WidgetSettings} from './components/WidgetSettings/WidgetSettings';

configure({lang: Lang.En});

DashKit.setSettings({
    gridLayout: {
        margin: [8, 8],
        rowHeight: 10,
    },
});

registerPlugins();

export function Dashboard() {
    const dispatch = useDispatch();

    const editMode = useSelector(selectEditMode);
    const config = useSelector(getSettingsData)['global::dashboard::config'];

    const {update} = useUpdateDashboard();

    const onDrop = (dropProps: ItemDropProps) => {
        dropProps.commit();
    };

    console.log(config);
    return (
        <div style={{margin: '8px'}}>
            <DashKitDnDWrapper>
                <DashKit
                    editMode={editMode}
                    config={config}
                    onChange={(dash) => {
                        update(dash.config);
                    }}
                    onDrop={onDrop}
                    onItemEdit={(edittingItem) => {
                        dispatch(editItem({edittingItem}));
                    }}
                    overlayMenuItems={['settings']}
                />
            </DashKitDnDWrapper>
            <WidgetSettings />
        </div>
    );
}
