import {Author} from '../OperationsWidgetContent/use-operations-widget';

export type OperationsSettingsValues = {
    name: string;
    authors: Array<Author>;
    autoheight: boolean;
    pool: string;
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
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
