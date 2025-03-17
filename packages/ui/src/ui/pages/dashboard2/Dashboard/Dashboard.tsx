import React from 'react';
import {useSelector} from 'react-redux';
import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, DashKitDnDWrapper, ItemDropProps} from '@gravity-ui/dashkit';

import {getConfig, getIsEditing} from '../../../store/selectors/dashboard2/dashboard';
import {registerPlugins} from './utils/registerPlugins';

configure({lang: Lang.En});

DashKit.setSettings({
    gridLayout: {
        margin: [8, 8],
        rowHeight: 10,
    },
});

registerPlugins();

export function Dashboard() {
    const isEditing = useSelector(getIsEditing);
    const config = useSelector(getConfig);
    const onDrop = (dropProps: ItemDropProps) => {
        dropProps.commit();
    };

    return (
        <div style={{margin: '8px'}}>
            <DashKitDnDWrapper>
                <DashKit
                    editMode={isEditing}
                    config={config || {}}
                    onChange={(dash) => {
                        //console.log(dash.config.layout);
                    }}
                    onDrop={onDrop}
                />
            </DashKitDnDWrapper>
        </div>
    );
}
