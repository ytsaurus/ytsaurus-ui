import i18n from './i18n';

export const STATISTIC_STATE = {
    completed: {
        sort: false,
        align: 'right',
        get tooltipProps() {
            return {placement: 'bottom', content: i18n('context_completed-hint')};
        },
    },
    aborted: {
        sort: false,
        align: 'right',
        get tooltipProps() {
            return {placement: 'bottom', content: i18n('context_aborted-hint')};
        },
    },
    failed: {
        sort: false,
        align: 'right',
        get tooltipProps() {
            return {placement: 'bottom', content: i18n('context_failed-hint')};
        },
    },
    lost: {
        sort: false,
        align: 'right',
        get tooltipProps() {
            return {placement: 'bottom', content: i18n('context_lost-hint')};
        },
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
