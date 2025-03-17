export function usePoolsSettings() {
    return [
        {
            type: 'text',
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Pools',
            },
        },
        // {
        //     type: 'text',
        //     name: 'pools',
        //     caption: 'Pools',
        //     extras: {
        //         placeholder: 'Select pools...',
        //     },
        // },
        {
            type: 'pool',
            name: 'pools',
            caption: 'Pools',
        },
    ];
}
