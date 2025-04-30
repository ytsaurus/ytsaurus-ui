export type QueriesSettingsValues = {
    name: string;
};

export function useQueriesSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Queries',
            },
        },
    ];
}
