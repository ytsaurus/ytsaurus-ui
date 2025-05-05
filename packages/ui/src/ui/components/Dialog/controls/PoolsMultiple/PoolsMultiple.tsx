import React, {useMemo} from 'react';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';

import {useFetchBatchQuery} from '../../../../store/api/yt';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';

import {YTApiId} from '../../../../../shared/constants/yt-api-id';

export interface PoolPair {
    tree: string;
    pool: string;
}

type Props = DialogControlProps<PoolPair[]> & {
    disabled?: boolean;
};

export function PoolsMultiple(props: Props) {
    const {value = [{tree: '', pool: ''}], onChange, disabled} = props;

    const {data: trees, isLoading: isTreesLoading} = useFetchBatchQuery<string>({
        id: YTApiId.listPoolsTrees,
        parameters: {
            requests: [
                {
                    command: 'list' as const,
                    parameters: {
                        path: '//sys/scheduler/orchid/scheduler/pool_trees',
                    },
                },
            ],
        },
    });

    const treesLoadedWithData = trees && trees.length && trees[0].output;

    const treesOptions = useMemo(() => {
        return treesLoadedWithData
            ? map_(trees[0].output, (item) => ({
                  value: item,
                  content: item,
              }))
            : [];
    }, [treesLoadedWithData]);

    const uniqueTrees = useMemo(() => {
        return value.map((pair) => pair.tree).filter((tree) => Boolean(tree));
    }, [value]);

    const poolRequests = useMemo(() => {
        return uniqueTrees.map((tree) => ({
            command: 'list' as const,
            parameters: {
                path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`,
            },
        }));
    }, [uniqueTrees]);

    const {data: allPools, isLoading: isAllPoolsLoading} = useFetchBatchQuery<string>({
        id: YTApiId.listPools,
        parameters: {
            requests: poolRequests,
        },
    });

    const poolOptionsMap = useMemo(() => {
        const result: Record<string, Array<{value: string; content: string}>> = {};

        if (allPools && allPools.length) {
            uniqueTrees.forEach((tree, index) => {
                if (allPools[index] && allPools[index].output) {
                    result[tree] = map_(ypath.getValue(allPools[index].output), (item) => ({
                        value: item,
                        content: item,
                    }));
                } else {
                    result[tree] = [];
                }
            });
        }

        return result;
    }, [allPools, uniqueTrees]);

    const handleAddPair = () => {
        onChange([...value, {tree: '', pool: ''}]);
    };

    const handleRemovePair = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const handleTreeChange = (index: number, newTree: string) => {
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            tree: newTree,
            pool: '', // Reset pool when tree changes
        };
        onChange(newValue);
    };

    const handlePoolChange = (index: number, newPool: string) => {
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            pool: newPool,
        };
        onChange(newValue);
    };

    return (
        <Flex gap={2} direction={'column'}>
            {value.map((pair, index) => (
                <Flex key={index} gap={2} direction={'row'} alignItems={'center'}>
                    <Select
                        onUpdate={(newValue) => handleTreeChange(index, newValue[0])}
                        options={treesOptions}
                        popupWidth={'fit'}
                        value={[pair.tree]}
                        filterable
                        hasClear
                        width={'max'}
                        loading={isTreesLoading}
                        disabled={disabled}
                        placeholder="Select tree"
                    />
                    <Select
                        onUpdate={(newValue) => handlePoolChange(index, newValue[0])}
                        options={pair.tree ? poolOptionsMap[pair.tree] || [] : []}
                        popupWidth={'fit'}
                        value={[pair.pool]}
                        filterable
                        hasClear
                        width={'max'}
                        loading={isAllPoolsLoading && Boolean(pair.tree)}
                        disabled={disabled || !pair.tree}
                        placeholder={'Select pool'}
                    />
                    {value.length > 1 && (
                        <Button
                            view={'flat'}
                            onClick={() => handleRemovePair(index)}
                            disabled={disabled}
                        >
                            Remove
                        </Button>
                    )}
                </Flex>
            ))}
            {Boolean(value.length) &&
                value[value.length - 1]?.pool &&
                value[value.length - 1]?.tree && (
                    <Flex>
                        <Button size={'m'} onClick={handleAddPair} disabled={disabled}>
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
    return [{tree: '', pool: ''}];
};

PoolsMultiple.validate = (value: PoolPair[]) => {
    if (!value.length) return;
    if (value[value.length - 1].tree && !value[value.length - 1].pool) {
        return 'Pool option is required';
    }
    return;
};
