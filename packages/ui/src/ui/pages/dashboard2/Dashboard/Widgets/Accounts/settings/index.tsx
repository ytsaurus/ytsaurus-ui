import {useSelector} from 'react-redux';

import map_ from 'lodash/map';

import hammer from '../../../../../../common/hammer';

import {getMediumList} from '../../../../../../store/selectors/thor';

export function useAccountsSettings() {
    const mediumList = useSelector(getMediumList);
    const mediumOptions = map_(mediumList, (item) => ({
        value: item,
        content: hammer.format['ReadableField'](item),
    }));
    return [
        {
            type: 'text',
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Accounts',
            },
        },
        {
            type: 'accounts-with-presets',
            name: 'accounts',
            caption: 'Accounts',
        },
        {
            type: 'select',
            name: 'medium',
            caption: 'Medium',
            extras: {
                placeholder: 'Default',
                width: 'max',
                options: mediumOptions,
            },
        },
    ];
}
