import {createSelector} from 'reselect';

import {selectCluster} from '../global';

export const selectAccountsRequestParams = createSelector([selectCluster], (cluster) => ({
    cluster,
}));
