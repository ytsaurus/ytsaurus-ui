import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {setPoolsTypeFilter} from '../../../../../../store/actions/dashboard2/pools';
import {getPoolsTypeFilter} from '../../../../../../store/selectors/dashboard2/pools';

export function PoolsWidgetControls(props: PluginWidgetProps) {
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
