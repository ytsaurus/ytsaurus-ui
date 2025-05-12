import {useSelector} from 'react-redux';

import map_ from 'lodash/map';

import hammer from '../../../../../../common/hammer';

import {getMediumList} from '../../../../../../store/selectors/thor';

export type AccountsSettingsValues = {
    name: string;
    accounts: string[];
    medium: string;
};

export function useAccountsSettings() {
    const mediumList = useSelector(getMediumList);
    const mediumOptions = map_(mediumList, (item) => ({
        value: item,
        content: hammer.format['ReadableField'](item),
    }));
    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Accounts',
            },
        },
        {
            type: 'accounts-with-presets' as const,
            name: 'accounts',
            caption: 'Accounts',
        },
        {
            type: 'select' as const,
            name: 'medium',
            caption: 'Medium',
            extras: {
                placeholder: 'Default',
                width: 'max' as const,
                options: mediumOptions,
            },
        },
    ];
}
