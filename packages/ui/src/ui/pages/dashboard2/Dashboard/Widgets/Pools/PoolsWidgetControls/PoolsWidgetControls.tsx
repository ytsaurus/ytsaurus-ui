import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Select} from '@gravity-ui/uikit';

import {
    selectVisibleResourcesRaw,
    updateVisibleResources,
} from '../../../../../../store/reducers/dashboard2/pools';

//type PoolsCols = 'cpu' | 'memory' | 'gpu' | 'operations';

export function PoolsWidgetControls() {
    const dispatch = useDispatch();
    const visibleResources = useSelector(selectVisibleResourcesRaw);
    return (
        <Select
            placeholder={'Resources'}
            value={visibleResources}
            options={[
                {value: 'cpu', content: 'CPU'},
                {value: 'memory', content: 'RAM'},
                {value: 'operations', content: 'Operations'},
                {value: 'gpu', content: 'GPU'},
            ]}
            multiple
            onUpdate={(value) => dispatch(updateVisibleResources({visibleResources: value}))}
        />
    );
}
