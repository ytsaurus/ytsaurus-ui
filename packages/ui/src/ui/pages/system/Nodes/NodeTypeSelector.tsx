import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Select} from '@gravity-ui/uikit';

import {NODE_TYPE_ITEMS} from '../../../constants/components/nodes/nodes';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';
import {setSysmetNodesNodeType} from '../../../store/actions/system/nodes-ts';
import {NODE_TYPE, NodeType} from '../../../../shared/constants/system';
import {getComponentsNodesNodeTypes} from '../../../store/selectors/components/nodes/nodes';
import {componentsNodesSetNodeTypes} from '../../../store/actions/components/nodes/nodes';
import {updateListWithAll} from '../../../utils';

type NodeTypeSelectorProps = {
    className?: string;
    value: Array<NodeType>;
    onUpdate: (value: NodeTypeSelectorProps['value']) => void;
};

export function NodeTypeSelector(props: NodeTypeSelectorProps) {
    const {className, value, onUpdate} = props;
    return (
        <Select
            className={className}
            value={value}
            multiple
            options={NODE_TYPE_ITEMS}
            onUpdate={(newVal) => {
                const newValue = updateListWithAll(
                    {value, newValue: newVal as NodeType[]},
                    NODE_TYPE.ALL_NODES,
                );
                onUpdate(newValue);
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
