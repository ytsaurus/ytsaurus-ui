import _ from 'lodash';
import hammer from '../../../common/hammer';
import {createSelector} from 'reselect';

const getStatisticsItems = (state) => state.operations.statistics.items;

const getTotalTimeItem = createSelector(getStatisticsItems, (items) =>
    _.find(items, ({attributes}) => attributes.name === 'total'),
);

export const getTotalJobWallTime = createSelector(getTotalTimeItem, (item) => {
    const sum = calculateItemSum(item);

    return sum === undefined ? hammer.format.NO_VALUE : sum;
});

function calculateItemSum(item) {
    if (item) {
        const prepared = _.mapValues(item.attributes.value, (value) =>
            _.mapValues(value, (innerValue) => innerValue.sum),
        );

        return _.sumBy(_.values(prepared), (item) => _.sum(_.values(item)));
    }

    return undefined;
}

const CPU_TIME_SPENT_PART_NAMES = {
    '<Root>/job_proxy/cpu/user/$$': true,
    '<Root>/job_proxy/cpu/system/$$': true,
    '<Root>/user_job/cpu/user/$$': true,
    '<Root>/user_job/cpu/system/$$': true,
};

export const getTotalCpuTimeSpent = createSelector([getStatisticsItems], (items) => {
    const filtered = _.filter(items, ({name}) => CPU_TIME_SPENT_PART_NAMES[name]);
    const sums = _.map(filtered, calculateItemSum);
    const valid = sums.filter((v) => v !== undefined);
    return valid.length ? _.sum(valid) : hammer.format.NO_VALUE;
});
