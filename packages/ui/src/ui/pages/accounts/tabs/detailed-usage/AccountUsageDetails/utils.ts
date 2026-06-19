import cn from 'bem-cn-lite';

import {type AccountUsageViewType} from '../../../../../store/reducers/accounts/usage/accounts-usage-filters';
import {type IconName} from '../../../../../components/Icon/Icon';

export const block = cn('account-usage-details');

export const getIconNameForViewType = (viewType: AccountUsageViewType): IconName | null => {
    if (viewType === 'tree' || viewType === 'tree-diff') {
        return null;
    }

    if (viewType === 'list' || viewType === 'list-diff') {
        return 'list';
    }

    return 'folders';
};
