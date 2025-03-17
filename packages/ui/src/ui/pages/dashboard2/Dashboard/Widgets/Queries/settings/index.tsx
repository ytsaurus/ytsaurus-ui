export function useQueriesSettings() {
    return [
        {
            type: 'text',
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Queries',
            },
        },
    ];
}
