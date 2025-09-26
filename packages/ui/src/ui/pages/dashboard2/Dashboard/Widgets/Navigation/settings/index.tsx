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
            name: 'show_navigation_input',
            caption: 'Show navigation input',
        },
    ];
}
