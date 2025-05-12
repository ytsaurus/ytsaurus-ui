import {PoolPair} from '../../../../../../components/Dialog/controls/PoolsMultiple/PoolsMultiple';

export type PoolsSettingsValues = {
    name: string;
    pools: PoolPair[];
    columns: string[];
};

export function usePoolsSettings() {
    const columnsOptions = [
        {value: 'cpu', content: 'CPU'},
        {value: 'memory', content: 'RAM'},
        {value: 'operations', content: 'Operations'},
        {value: 'gpu', content: 'GPU'},
    ];

    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Pools',
            },
        },
        {
            type: 'pools-multiple' as const,
            name: 'pools',
            caption: 'Pools',
        },
        {
            type: 'select' as const,
            name: 'columns',
            caption: 'Resources columns',
            extras: {
                placeholder: 'Default',
                width: 'max' as const,
                options: columnsOptions,
                multiple: true,
            },
        },
    ];
}
