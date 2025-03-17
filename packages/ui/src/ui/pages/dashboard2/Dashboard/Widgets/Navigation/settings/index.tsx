export function useNavigationSettings() {
    return [
        {
            type: 'text',
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Navigation',
            },
        },
    ];
}
