import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Select} from '@gravity-ui/uikit';

import {NODE_TYPE_ITEMS} from '../../../constants/components/nodes/nodes';
import {getSettingSystemNodesNodeType} from '../../../store/selectors/settings-ts';
import {setSysmetNodesNodeType} from '../../../store/actions/system/nodes-ts';

export default function NodeTypeSelector() {
    const dispatch = useDispatch();
    const value = useSelector(getSettingSystemNodesNodeType);
    return (
        <Select
            value={[value!]}
            options={NODE_TYPE_ITEMS}
            onUpdate={([value]) => {
                dispatch(setSysmetNodesNodeType(value as any));
            }}
            label={'Node type:'}
        />
    );
}
