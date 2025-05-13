export type QueriesSettingsValues = {
    name: string;
    autoheight: boolean;
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
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
