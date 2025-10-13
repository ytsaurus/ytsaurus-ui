import React from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {getNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';
import {setNavigationTypeFilter} from '../../../../../../store/actions/dashboard2/navigation';

import type {NavigationWidgetProps} from '../types';

import i18n from '../i18n';

export function NavigationWidgetControls(props: NavigationWidgetProps) {
    const dispatch = useDispatch();
    const type = useSelector((state: RootState) => getNavigationTypeFilter(state, props.id));
    const onUpdate = (value: 'last_visited' | 'favourite') => {
        dispatch(setNavigationTypeFilter(props.id, value));
    };

    return (
        <SegmentedRadioGroup
            options={[
                {value: 'last_visited', content: i18n('value_last-visited')},
                {value: 'favourite', content: i18n('value_favourite')},
            ]}
            value={type}
            onUpdate={onUpdate}
        ></SegmentedRadioGroup>
    );
}
