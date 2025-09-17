import i18n from '../i18n';

export function useQueriesSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: i18n('field_name'),
            extras: {
                placeholder: i18n('placeholder_queries'),
            },
        },
        {
            name: 'authors',
            type: 'acl-subjects' as const,
            caption: i18n('field_author'),
            required: true,
            extras: {
                placeholder: i18n('placeholder_enter-name-or-login'),
                allowedTypes: ['users' as const],
            },
        },
        {
            name: 'limit',
            type: 'number' as const,
            required: true,
            caption: i18n('field_limit'),
            extras: {
                min: 0,
                max: 50,
                hidePrettyValue: true,
            },
        },
    ];
}
