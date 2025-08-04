import React from 'react';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';

import {useTrees} from './use-trees';
import {usePools} from './use-pools';
import {useActions} from './use-actions';

export interface PoolPair {
    tree: string;
    pool: string;
}

type Props = DialogControlProps<PoolPair[]> & {
    disabled?: boolean;
    mode?: 'multiple' | 'single';
};

export function PoolsMultiple(props: Props) {
    const {value, onChange, disabled, mode = 'multiple'} = props;

    const {trees, isTreesLoading, treesOptions} = useTrees(value);

    const {poolOptionsMap, isPoolsLoading} = usePools(trees);

    const {removePair, addPair, updateTree, updatePool} = useActions(value, onChange);

    const isPoolsPairsAvailable =
        Boolean(value?.length) &&
        value?.[value?.length - 1]?.pool &&
        value?.[value.length - 1]?.tree;

    return (
        <Flex gap={2} direction={'column'}>
            {(value?.length ? value : [{tree: '', pool: ''}]).map((pair, index) => (
                <Flex key={index} gap={2} direction={'row'} alignItems={'center'}>
                    <Select
                        onUpdate={(newValue) => updateTree(index, newValue[0])}
                        options={treesOptions}
                        popupWidth={'fit'}
                        value={[pair.tree]}
                        filterable
                        hasClear
                        width={'max'}
                        loading={isTreesLoading}
                        disabled={disabled}
                        placeholder={'Select tree'}
                    />
                    <Select
                        onUpdate={(newValue) => updatePool(index, newValue[0])}
                        options={pair.tree ? poolOptionsMap[pair.tree] || [] : []}
                        popupWidth={'fit'}
                        value={[pair.pool]}
                        filterable
                        hasClear
                        width={'max'}
                        loading={isPoolsLoading && Boolean(pair.tree)}
                        disabled={disabled || !pair.tree}
                        placeholder={'Select pool'}
                    />
                    {value.length > 1 && (
                        <Button view={'flat'} onClick={() => removePair(index)} disabled={disabled}>
                            Remove
                        </Button>
                    )}
                </Flex>
            ))}
            {isPoolsPairsAvailable && mode === 'multiple' && (
                <Flex>
                    <Button size={'m'} onClick={addPair} disabled={disabled}>
                        <Flex alignItems={'center'} gap={2}>
                            <Plus />
                            Add Pool Pair
                        </Flex>
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}

PoolsMultiple.isEmpty = (value: PoolPair[]) => {
    return !value || value.length === 0 || value.every((pair) => !pair.tree || !pair.pool);
};

PoolsMultiple.getDefaultValue = () => {
    return [];
};

PoolsMultiple.validate = (value: PoolPair[]) => {
    if (!value.length) return;
    if (value?.[value.length - 1].tree && !value?.[value.length - 1]?.pool) {
        return 'Pool option is required';
    }
    if (!value?.[value.length - 1]?.tree?.length) {
        return 'Tree should not be empty';
    }
    return;
};
