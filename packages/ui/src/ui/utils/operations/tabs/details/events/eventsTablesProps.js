import {prepareTableColumns} from '../../../../../utils/index';
import hammer from '../../../../../common/hammer';
import {i18n as globalI18n} from '../../../../../i18n';
import i18n from './i18n';

function formatState(state) {
    const key = `value_${state}`;
    if (globalI18n.has('yt:events-table-props', key)) {
        return i18n(key);
    }
    return hammer.format['Readable'](state);
}

export const columns = {
    state: {
        align: 'left',
        get caption() {
            return i18n('field_state');
        },
        get(event) {
            return formatState(event.state);
        },
    },
    phase: {
        align: 'left',
        get caption() {
            return i18n('field_state-phase');
        },
        get(event) {
            if (event.state === 'total') {
                return i18n('value_total');
            }

            const formatter = hammer.format['Readable'];
            const state = formatState(event.state);
            const phase = formatter(event.phase || hammer.format.NO_VALUE);

            return `${state} : ${phase}`;
        },
    },
    progress: {
        align: 'center',
        caption: '',
        get(event) {
            const progressValue = event.progress && event.progress.duration;

            return {
                value: progressValue,
                theme:
                    {
                        initializing: 'grass',
                        preparing: 'mint',
                        pending: 'aqua',
                        materializing: 'bluejeans',
                        running: 'lavander',
                        completing: 'grapefruit',
                        reviving: 'bittersweet',
                        reviving_jobs: 'sunflower',
                        failed: 'grapefruit',
                    }[event.state] || 'mediumgray',
            };
        },
    },
    duration: {
        align: 'right',
        get caption() {
            return i18n('field_duration');
        },
        get(event) {
            return event.duration;
        },
    },
    start_time: {
        align: 'left',
        get caption() {
            return i18n('field_start-time');
        },
        get(event) {
            return event.time;
        },
    },
    actions: {
        align: 'center',
        caption: '',
    },
};

const DEFAULT_MODE = 'default';
const WITH_ACTIONS_MODE = 'withActions';

const getEventsGeneralProps = (type) => ({
    theme: 'light',
    striped: false,
    virtual: true,
    header: false,
    size: 'm',
    computeKey(item) {
        return item.state + '/' + item.time;
    },
    columns: {
        items: prepareTableColumns(columns),
        sets: {
            [DEFAULT_MODE]: {
                items: [type, 'progress', 'duration', 'start_time'],
            },
            [WITH_ACTIONS_MODE]: {
                items: [type, 'progress', 'duration', 'start_time', 'actions'],
            },
        },
        mode: DEFAULT_MODE,
    },
});

export function getEventsTableProps(showActions, type) {
    const eventsTableProps = getEventsGeneralProps(type);
    let res = eventsTableProps;
    if (showActions) {
        res = {...eventsTableProps};
        res.columns = {
            ...res.columns,
            mode: WITH_ACTIONS_MODE,
        };
    }
    return res;
}
