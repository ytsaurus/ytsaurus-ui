import React from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {setPoolsTypeFilter} from '../../../../../../store/actions/dashboard2/pools';
import {getPoolsTypeFilter} from '../../../../../../store/selectors/dashboard2/pools';

import type {PoolsWidgetProps} from '../types';

import i18n from '../i18n';

export function PoolsWidgetControls(props: PoolsWidgetProps) {
    const dispatch = useDispatch();

    const type = useSelector((state: RootState) => getPoolsTypeFilter(state, props.id));

    const onUpdate = (value: 'favourite' | 'custom') => {
        dispatch(setPoolsTypeFilter(props.id, value));
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
