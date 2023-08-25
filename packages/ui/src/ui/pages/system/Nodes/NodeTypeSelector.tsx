import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Select} from '@gravity-ui/uikit';

import {NODE_TYPE_ITEMS} from '../../../constants/components/nodes/nodes';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';
import {setSysmetNodesNodeType} from '../../../store/actions/system/nodes-ts';
import {NODE_TYPE, NodeType} from '../../../../shared/constants/system';
import {getComponentsNodesNodeTypes} from '../../../store/selectors/components/nodes/nodes';
import {componentsNodesSetNodeTypes} from '../../../store/actions/components/nodes/nodes';

type NodeTypeSelectorProps = {
    className?: string;
    value: Array<NodeType>;
    onUpdate: (value: NodeTypeSelectorProps['value']) => void;
};

export function NodeTypeSelector(props: NodeTypeSelectorProps) {
    const {className, value, onUpdate} = props;
    const hasAllItem = value.indexOf(NODE_TYPE.ALL_NODES) !== -1;
    return (
        <Select
            className={className}
            value={value}
            multiple
            options={NODE_TYPE_ITEMS}
            onUpdate={(newValue) => {
                const allItemIndex = newValue.indexOf(NODE_TYPE.ALL_NODES);
                if (newValue.length > value.length && hasAllItem) {
                    const tmp = [...newValue];
                    tmp.splice(allItemIndex, 1);
                    onUpdate(tmp as typeof value);
                } else if (!hasAllItem && allItemIndex !== -1) {
                    onUpdate([NODE_TYPE.ALL_NODES]);
                } else {
                    onUpdate(newValue as typeof value);
                }
            }}
            label={'Node type:'}
        />
    );
}

export function SystemNodeTypeSelector() {
    const dispatch = useDispatch();
    const value = useSelector(getSystemNodesNodeTypesToLoad);
    return (
        <NodeTypeSelector
            value={value}
            onUpdate={(newValue) => {
                dispatch(setSysmetNodesNodeType(newValue));
            }}
        />
    );
}

export function ComponentsNodeTypeSelector({className}: {className?: string}) {
    const dispatch = useDispatch();

    const value = useSelector(getComponentsNodesNodeTypes);
    return (
        <NodeTypeSelector
            className={className}
            value={value}
            onUpdate={(newValue) => dispatch(componentsNodesSetNodeTypes(newValue))}
        />
    );
}
