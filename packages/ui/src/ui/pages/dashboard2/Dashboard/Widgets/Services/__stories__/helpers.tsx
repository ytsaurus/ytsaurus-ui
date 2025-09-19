import React from 'react';
import {useDispatch} from 'react-redux';
import {WidgetBase} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetBase/WidgetBase';
import {baseWidgetProps} from '../../../../../../pages/dashboard2/Dashboard/utils/mocks';
import {setSettingByKey} from '../../../../../../store/actions/settings';
import {ServicesWidgetContent} from '../ServicesWidgetContent/ServicesWidgetContent';
import {ServicesWidgetControls} from '../ServicesWidgetControls/ServicesWidgetControls';
import {ServicesWidgetHeader} from '../ServicesWidgetHeader/ServicesWidgetHeader';
import {ServicesWidgetProps} from '../types';

export function ServicesEmptyWidgetStory() {
    const dispatch = useDispatch();
    // @ts-ignore
    dispatch(setSettingByKey('local::test-cluster::chyt::favourites' as const, null));
    return (
        <div style={{height: 300, width: 550}}>
            <WidgetBase
                {...baseWidgetProps}
                controls={<ServicesWidgetControls {...(baseWidgetProps as ServicesWidgetProps)} />}
                content={<ServicesWidgetContent {...(baseWidgetProps as ServicesWidgetProps)} />}
                header={<ServicesWidgetHeader {...(baseWidgetProps as ServicesWidgetProps)} />}
            />
        </div>
    );
}
