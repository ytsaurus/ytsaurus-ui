import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Select} from '@gravity-ui/uikit';

import {NODE_TYPE_ITEMS} from '../../../constants/components/nodes/nodes';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';
import {setSysmetNodesNodeType} from '../../../store/actions/system/nodes-ts';
import {NODE_TYPE} from '../../../../shared/constants/system';

export default function NodeTypeSelector() {
    const dispatch = useDispatch();
    const value = useSelector(getSystemNodesNodeTypesToLoad);
    const hasAllItem = value.indexOf(NODE_TYPE.ALL_NODES) !== -1;
    return (
        <Select
            value={value}
            multiple
            options={NODE_TYPE_ITEMS}
            onUpdate={(newValue) => {
                const allItemIndex = newValue.indexOf(NODE_TYPE.ALL_NODES);
                if (newValue.length > value.length && hasAllItem) {
                    const tmp = [...newValue];
                    tmp.splice(allItemIndex, 1);
                    dispatch(setSysmetNodesNodeType(tmp as typeof value));
                } else if (!hasAllItem && allItemIndex !== -1) {
                    dispatch(setSysmetNodesNodeType([NODE_TYPE.ALL_NODES]));
                } else {
                    dispatch(setSysmetNodesNodeType(newValue as typeof value));
                }
            }}
            label={'Node type:'}
        />
    );
}
