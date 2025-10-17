import i18n from '../i18n';

export function useNavigationSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: i18n('field_name'),
            extras: {
                placeholder: i18n('placeholder_navigation'),
            },
        },
        {
            type: 'tumbler' as const,
            name: 'show_navigation_input',
            caption: 'Show navigation input',
        },
    ];
}
