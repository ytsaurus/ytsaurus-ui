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
    ];
}
