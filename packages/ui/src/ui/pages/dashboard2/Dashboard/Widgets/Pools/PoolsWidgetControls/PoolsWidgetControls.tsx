import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {setPoolsTypeFilter} from '../../../../../../store/actions/dashboard2/pools';
import {getPoolsTypeFilter} from '../../../../../../store/selectors/dashboard2/pools';

import type {PoolsWidgetProps} from '../types';

export function PoolsWidgetControls(props: PoolsWidgetProps) {
    const dispatch = useDispatch();

    const type = useSelector((state: RootState) => getPoolsTypeFilter(state, props.id));

    const onUpdate = (value: 'favourite' | 'custom') => {
        dispatch(setPoolsTypeFilter(props.id, value));
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
