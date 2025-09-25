import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {setServicesTypeFilter} from '../../../../../../store/actions/dashboard2/services';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';

import type {ServicesWidgetProps} from '../types';

import i18n from '../i18n';

export function ServicesWidgetControls(props: ServicesWidgetProps) {
    const dispatch = useDispatch();

    const type = useSelector((state: RootState) => getServicesTypeFilter(state, props.id));

    const onUpdate = (value: 'favourite' | 'custom') => {
        dispatch(setServicesTypeFilter(props.id, value));
    };

    return (
        <SegmentedRadioGroup
            options={[
                {value: 'favourite', content: i18n('value_favourite')},
                {value: 'custom', content: i18n('value_custom')},
            ]}
            value={type}
            onUpdate={onUpdate}
        ></SegmentedRadioGroup>
    );
}
