import {prepareTableColumns} from '../../../../../utils/index';
import hammer from '../../../../../common/hammer';

export const columns = {
    state: {
        align: 'left',
        get(event) {
            return event.state;
        },
    },
    phase: {
        align: 'left',
        caption: 'State : Phase',
        get(event) {
            if (event.state === 'total') {
                return 'Total';
            }

            const formatter = hammer.format['Readable'];
            const state = formatter(event.state);
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
        get(event) {
            return event.duration;
        },
    },
    start_time: {
        align: 'left',
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
