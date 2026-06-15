import filter_ from 'lodash/filter';
import {createSelector} from 'reselect';

import hammer from '../../../common/hammer';
import {MediumType} from '../../../constants/index';

export const selectMediumList = createSelector(
    (state) => state.global.mediumList,
    (data) => hammer.utils.sortInPredefinedOrder([MediumType.DEFAULT], [...data]),
);

export const selectMediumListNoCache = createSelector([selectMediumList], (mediums) =>
    filter_(mediums, (item) => item !== 'cache'),
);

export const selectCurrentCluster = (state) => state.global.cluster;
