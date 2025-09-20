import i18n from '../i18n';

export function usePoolsSettings() {
    const columnsOptions = [
        {value: 'cpu', content: i18n('field_cpu')},
        {value: 'memory', content: i18n('field_ram')},
        {value: 'operations', content: i18n('field_operations')},
        {value: 'gpu', content: i18n('field_gpu')},
    ];

    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: i18n('field_name'),
            extras: {
                placeholder: i18n('placeholder_pools'),
            },
        },
        {
            type: 'pools-multiple' as const,
            name: 'pools',
            caption: i18n('field_pools'),
        },
        {
            type: 'select' as const,
            name: 'columns',
            caption: i18n('field_resources-columns'),
            extras: {
                placeholder: i18n('value_default'),
                width: 'max' as const,
                options: columnsOptions,
                multiple: true,
            },
        },
    ];
}
