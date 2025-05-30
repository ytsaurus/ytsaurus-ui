export type NavigationSettingsValues = {
    name: string;
    autoheight: string;
};

export function useNavigationSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Navigation',
            },
        },
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
