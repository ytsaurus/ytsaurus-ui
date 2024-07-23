import filter_ from 'lodash/filter';
import {createSelector} from 'reselect';

import hammer from '../../../common/hammer';
import {MediumType} from '../../../constants/index';
export {isSupportedSelector} from './support';

export const getMediumList = createSelector(
    (state) => state.global.mediumList,
    (data) => hammer.utils.sortInPredefinedOrder([MediumType.DEFAULT], [...data]),
);

export const getMediumListNoCache = createSelector([getMediumList], (mediums) =>
    filter_(mediums, (item) => item !== 'cache'),
);

export const getCurrentCluster = (state) => state.global.cluster;
