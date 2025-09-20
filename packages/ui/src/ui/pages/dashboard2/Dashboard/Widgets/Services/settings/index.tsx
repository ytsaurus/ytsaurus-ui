import i18n from '../i18n';

export function useServicesSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: i18n('field_name'),
            extras: {
                placeholder: i18n('placeholder_services'),
            },
        },
        {
            type: 'services-select' as const,
            name: 'services',
            caption: i18n('field_services'),
        },
    ];
}
