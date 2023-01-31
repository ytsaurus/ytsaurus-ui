export {TimelinePicker} from './TimelinePicker/TimelinePicker';

export {convertTimeToRequestParams, formatInterval} from './util';

function shortcut(time: string, title?: string) {
    return {time, title: title || time};
}

export const TIMELINE_RANGE_PICKER_SHORTCUTS = [
    [shortcut('4h'), shortcut('8h'), shortcut('12h'), shortcut('24h')],
    [shortcut('2d'), shortcut('7d', 'Week'), shortcut('2w', '2 Weeks')],
    [shortcut('1M', 'Month'), shortcut('2M', '2 Months')],
];
