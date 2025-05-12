import {PoolPair} from './PoolsMultiple';

export function useActions(value: PoolPair[], onChange: (v: PoolPair[]) => void) {
    const addPair = () => {
        onChange([...value, {tree: '', pool: ''}]);
    };

    const removePair = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const updateTree = (index: number, newTree: string) => {
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            tree: newTree,
            pool: '', // Reset pool when tree changes
        };
        onChange(newValue);
    };

    const updatePool = (index: number, newPool: string) => {
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            pool: newPool,
        };
        onChange(newValue);
    };

    return {
        addPair,
        removePair,
        updateTree,
        updatePool,
    };
}
