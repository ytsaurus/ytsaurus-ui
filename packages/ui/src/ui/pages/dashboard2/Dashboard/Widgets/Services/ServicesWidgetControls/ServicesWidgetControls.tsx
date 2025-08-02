import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {setServicesTypeFilter} from '../../../../../../store/actions/dashboard2/services';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';

import type {ServicesWidgetProps} from '../types';

export function ServicesWidgetControls(props: ServicesWidgetProps) {
    const dispatch = useDispatch();

    const type = useSelector((state: RootState) => getServicesTypeFilter(state, props.id));

    const onUpdate = (value: 'favourite' | 'custom') => {
        dispatch(setServicesTypeFilter(props.id, value));
    };

    return (
        <RadioButton
            options={[
                {value: 'favourite', content: 'Favourite'},
                {value: 'custom', content: 'Custom'},
            ]}
            value={type}
            onUpdate={onUpdate}
        ></RadioButton>
    );
}
