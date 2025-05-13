export type OperationsSettingsValues = {
    name: string;
    authors: string[];
    autoheight: boolean;
};

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
            required: true,
            extras: {
                placeholder: 'Enter name or login',
            },
        },
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
