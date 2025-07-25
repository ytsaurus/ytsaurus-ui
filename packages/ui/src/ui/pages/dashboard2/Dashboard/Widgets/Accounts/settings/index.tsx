import {useSelector} from 'react-redux';

import {getMediumList} from '../../../../../../store/selectors/thor';

export type AccountsSettingsValues = {
    name: string;
    accounts: string[];
    autoheight: boolean;
    columns: string[];
};

export function useAccountsSettings() {
    const mediumList = useSelector(getMediumList);

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
            type: 'table-sort-by' as const,
            name: 'disk_columns',
            caption: 'Disk space columns(mediums)',
            extras: {
                suggestColumns: mediumList,
            },
        },
        {
            type: 'table-sort-by' as const,
            name: 'columns',
            caption: 'Columns',
            extras: {
                suggestColumns: ['Nodes', 'Chunks'],
            },
        },
        {
            type: 'tumbler' as const,
            name: 'autoheight',
            caption: 'Use autoheight',
        },
    ];
}
