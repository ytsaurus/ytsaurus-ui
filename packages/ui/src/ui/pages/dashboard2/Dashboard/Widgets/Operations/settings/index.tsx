export function useOperationsSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Operations',
            },
        },
        {
            name: 'authors',
            type: 'acl-subjects' as const,
            caption: 'Authors',
            extras: {
                placeholder: 'Enter name or login',
                allowedTypes: ['users' as const],
            },
        },
        {
            name: 'pool',
            type: 'pools-multiple' as const,
            caption: 'Pool',
            extras: {
                mode: 'single' as const,
            },
        },
        {
            name: 'limit',
            type: 'number' as const,
            required: true,
            caption: 'Limit(per author)',
            extras: {
                hidePrettyValue: true,
            },
        },
    ];
}
