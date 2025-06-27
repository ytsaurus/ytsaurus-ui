import {Author} from '../OperationsWidgetContent/use-operations-widget';

export type OperationsSettingsValues = {
    name: string;
    authors: Array<Author>;
    pool: string;
    limit: number;
};

export function useOperationsSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Operations',
            },
        },
        {
            name: 'limit',
            type: 'number' as const,
            required: true,
            caption: 'Limit(per author)',
            extras: {
                hidePrettyValue: true,
            },
        },
        {
            name: 'authors',
            type: 'acl-subjects' as const,
            caption: 'Authors',
            extras: {
                placeholder: 'Enter name or login',
                allowedTypes: ['users' as const],
            },
        },
        {
            name: 'pool',
            type: 'pool' as const,
            caption: 'Pool',
        },
    ];
}
