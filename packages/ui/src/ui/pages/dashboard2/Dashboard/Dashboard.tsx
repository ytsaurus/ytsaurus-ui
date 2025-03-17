import React from 'react';
import {useSelector} from 'react-redux';
import {Lang, configure} from '@gravity-ui/uikit';
import {DashKit, DashKitDnDWrapper, DashKitProps, ItemDropProps} from '@gravity-ui/dashkit';

import {getIsEditing} from '../../../store/selectors/dashboard2';
import {WidgetBase} from './WidgetBase/WidgetBase';
import {NavigationWidgetContent} from './Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from './Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';

configure({lang: Lang.En});

DashKit.setSettings({
    gridLayout: {margin: [8, 8]},
});

DashKit.registerPlugins({
    type: 'custom',
    defaultLayout: {
        h: 13,
        w: 11,
        minH: 6,
        minW: 11,
        maxH: 15.5,
        maxW: 16,
    },
    renderer: function CustomPlugin() {
        return (
            <WidgetBase
                title="Navigation"
                controls={<NavigationWidgetControls />}
                content={<NavigationWidgetContent />}
            />
        );
    },
});

const config: DashKitProps['config'] = {
    salt: '0.46703554571365613',
    counter: 3,
    items: [
        {
            id: 'Ea',
            data: {
                text: 'mode _editActive',
            },
            type: 'custom',
            namespace: 'default',
        },
        {
            id: 'zR',
            data: {
                text: '### Text',
            },
            type: 'custom',
            namespace: 'default',
            orderId: 0,
        },
        {
            id: 'Dk',
            data: {
                foo: 'bar',
            },
            type: 'custom',
            namespace: 'default',
            orderId: 5,
        },
    ],
    layout: [
        {
            i: 'Ea',
            h: 13,
            w: 11,
            x: 0,
            y: 0,
        },
        {
            h: 13,
            i: 'zR',
            w: 11,
            x: 12,
            y: 2,
        },
        {
            h: 13,
            i: 'Dk',
            w: 11,
            x: 0,
            y: 8,
        },
    ],
    aliases: {},
    connections: [],
};

export function Dashboard() {
    const isEditing = useSelector(getIsEditing);

    const onDrop = (dropProps: ItemDropProps) => {
        dropProps.commit();
    };

    return (
        <DashKitDnDWrapper>
            <DashKit
                editMode={isEditing}
                config={config}
                onChange={(dash) => {
                    console.log(dash.config.layout);
                }}
                onDrop={onDrop}
            />
        </DashKitDnDWrapper>
    );
}
