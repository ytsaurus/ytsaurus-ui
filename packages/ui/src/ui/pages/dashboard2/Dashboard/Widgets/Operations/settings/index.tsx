import i18n from '../i18n';

export function useOperationsSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: i18n('field_name'),
            extras: {
                placeholder: i18n('placeholder_operations'),
            },
        },
        {
            name: 'authors',
            type: 'acl-subjects' as const,
            caption: i18n('field_authors'),
            extras: {
                placeholder: i18n('placeholder_enter-name-or-login'),
                allowedTypes: ['users' as const],
            },
        },
        {
            name: 'pool',
            type: 'pools-multiple' as const,
            caption: i18n('field_pool'),
            extras: {
                mode: 'single' as const,
            },
        },
        {
            name: 'limit',
            type: 'number' as const,
            required: true,
            caption: i18n('field_limit'),
            extras: {
                hidePrettyValue: true,
            },
        },
    ];
}
