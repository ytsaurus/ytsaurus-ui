const completedHintText =
    'Completed jobs — those which have finished successfully (i.e. consumed entire input and exited with zero exit code). Please note that due to hardware failures some jobs may be run more than once.';
const abortedHintText =
    'Aborted jobs — those with soft failure (i.e. resource overdraft or preemption). Please note that some of aborted jobs may be excluded from statistics.';
const failedHintText =
    'Failed jobs — those with hard failure (i.e. exited with non-zero exit code). Please note that some of failed jobs may be excluded from statistics.';
const lostHintText =
    'Lost jobs — those which have finished successfully but whose results were lost (typically due to hardware failures).';

export const STATISTIC_STATE = {
    completed: {
        sort: false,
        align: 'right',
        tooltipProps: {placement: 'bottom', content: completedHintText},
    },
    aborted: {
        sort: false,
        align: 'right',
        tooltipProps: {placement: 'bottom', content: abortedHintText},
    },
    failed: {
        sort: false,
        align: 'right',
        tooltipProps: {placement: 'bottom', content: failedHintText},
    },
    lost: {
        sort: false,
        align: 'right',
        tooltipProps: {placement: 'bottom', content: lostHintText},
    },
};

export const statisticsTableProps = {
    theme: 'light',
    size: 's',
    striped: false,
    computeKey(item) {
        return `<Root>/${item.name}`;
    },
    tree: true,
    columns: {
        sets: {
            default: {
                items: ['metric'].concat(Object.keys(STATISTIC_STATE)),
            },
        },
        items: {...STATISTIC_STATE, metric: {sort: false, align: 'left'}},
        mode: 'default',
    },
};
