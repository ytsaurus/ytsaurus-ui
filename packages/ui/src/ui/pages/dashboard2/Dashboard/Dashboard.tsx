import React from 'react';
import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, ItemDropProps} from '@gravity-ui/dashkit';

import {useDisableMaxContentWidth} from '../../../containers/MaxContentWidth';

configure({lang: Lang.En});

DashKit.setSettings({
    gridLayout: {
        margin: [8, 8],
    },
});

export function Dashboard() {
    useDisableMaxContentWidth();

    const onDrop = (dropProps: ItemDropProps) => {
        dropProps.commit();
    };

    return (
        <div style={{margin: '8px'}}>
            <DashKit
                editMode={false}
                config={{}}
                onChange={() => {}}
                onDrop={onDrop}
                onItemEdit={() => {}}
                overlayMenuItems={['settings']}
            />
        </div>
    );
}
