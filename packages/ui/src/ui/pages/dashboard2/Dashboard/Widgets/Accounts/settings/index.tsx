import {useSelector} from '../../../../../../store/redux-hooks';

import {getMediumList} from '../../../../../../store/selectors/thor';

import i18n from '../i18n';

export function useAccountsSettings() {
    const mediumList = useSelector(getMediumList);

    return [
        {
            type: 'text' as const,
            name: 'name',
            caption: i18n('field_name'),
            extras: {
                placeholder: i18n('placeholder_accounts'),
            },
        },
        {
            type: 'accounts-with-presets' as const,
            name: 'accounts',
            caption: i18n('field_accounts'),
        },
        {
            type: 'table-sort-by' as const,
            name: 'columns',
            caption: i18n('field_columns'),
            extras: {
                suggestColumns: ['Nodes', 'Chunks', ...mediumList],
                formatReadable: true,
            },
        },
    ];
}
