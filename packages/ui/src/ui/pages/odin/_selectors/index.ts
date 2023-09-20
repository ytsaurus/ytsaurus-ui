import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';

import Utils, {currentDate} from '../odin-utils';
import {COLS_NUMBER} from '../odin-constants';
import {makeGetSetting} from '../../../store/selectors/settings';
import {ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES} from '../odin-settings';
import {OdinRootState} from '../_reducers';
import YT from '../../../config/yt-config';

export const getMetric = (state: OdinRootState) => state.odin.details.metric;
export const getUseCurrentDate = (state: OdinRootState) => state.odin.details.useCurrentDate;
export const getHours = (state: OdinRootState) => state.odin.details.hours;
export const getMinutes = (state: OdinRootState) => state.odin.details.minutes;
export const getMetricAvailability = (state: OdinRootState) =>
    state.odin.details.metricAvailability;

export const getDate = (state: OdinRootState) => {
    if (getUseCurrentDate(state)) {
        return currentDate();
    }
    return state.odin.details.date;
};

export const getStat = createSelector([getMetricAvailability], (availability) => {
    return Utils.computeStat(availability);
});

export const getExtendedInfo = createSelector(
    [getMetricAvailability, getDate, getHours, getMinutes],
    (availability, date, hours, minutes) => {
        let info;
        if (hours !== -1 && minutes !== -1) {
            const index = hours * COLS_NUMBER + minutes;

            info = availability[index];
            if (info) {
                info = {
                    ...info,
                    date: moment(date)
                        .set({hour: hours, minute: minutes})
                        .format('DD-MM-YYYY HH:mm'),
                };
            }
        }

        return info;
    },
);

export const getOdinCluster = (state: OdinRootState) => state.odin.details.odinCluster;
function makeClusterNameItems() {
    const names = _.map(YT.clusters, 'id').sort();
    return _.map(names, (name) => {
        return {
            key: name,
            value: name,
            title: (YT.clusters[name] || {name}).name,
        };
    });
}

export const ODIN_CLUSTER_NAMES_ITEMS = makeClusterNameItems();

export const getSettingOdinOverviewVisiblePresets = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN) || [];
});
