export function useServicesSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Services',
            },
        },
        {
            type: 'services-select' as const,
            name: 'services',
            caption: 'Services',
        },
    ];
}
