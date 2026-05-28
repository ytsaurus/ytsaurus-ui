import filter_ from 'lodash/filter';
import {createSelector} from 'reselect';

import hammer from '../../../common/hammer';
import {MediumType} from '../../../constants/index';
import ypath from '../../../common/thor/ypath';

export const getMediumItems = createSelector(
    (state) => state.global.mediumList,
    (data = []) => data,
);

export const getMediumList = createSelector([getMediumItems], (data) => {
    const mediumNames = data.map((item) => ypath.getValue(item));

    return hammer.utils.sortInPredefinedOrder([MediumType.DEFAULT], mediumNames);
});

export const getMediumListNoCache = createSelector([getMediumList], (mediums) =>
    filter_(mediums, (item) => item !== 'cache'),
);

export const getSystemReservedDiskSpaceByMedium = createSelector([getMediumItems], (data) => {
    const res = {};

    data.forEach((item) => {
        const name = item.$value;

        if (!name) {
            return;
        }

        res[name] = ypath.getValue(item, '/@system_reserved_disk_space') ?? 0;
    });
    return res;
});

export const getUncommittedDiskSpaceByMedium = createSelector(
    [(state) => state.global.uncommittedDiskSpacePerMedium],
    (data = {}) => data,
);

export const getCurrentCluster = (state) => state.global.cluster;
