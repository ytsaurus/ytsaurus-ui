import {FIX_MY_TYPE} from '../../../../../../../@types/types';
import {Author} from '../OperationsWidgetContent/use-operations-widget';

export type OperationsSettingsValues = {
    name: string;
    authors: Array<Author>;
    autoheight: boolean;
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
            required: true,
            extras: {
                placeholder: 'Enter name or login',
                allowedTypes: ['users'],
            },
        } as FIX_MY_TYPE, // types break for some reason when allowed types not default
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
