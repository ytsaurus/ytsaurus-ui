import {FIX_MY_TYPE} from '../../../../../../../@types/types';

export type Author = {
    value: string;
    type: 'users';
};

export type QueriesSettingsValues = {
    name: string;
    authors: Array<Author>;
    autoheight: boolean;
};

export function useQueriesSettings() {
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Queries',
            },
        },
        {
            name: 'authors',
            type: 'acl-subjects' as const,
            caption: 'Authors',
            required: true,
            extras: {
                placeholder: 'Enter name or login',
                allowedTypes: ['users'],
            },
        } as FIX_MY_TYPE,
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
