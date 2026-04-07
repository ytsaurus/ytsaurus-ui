export {TimelinePicker} from './TimelinePicker/TimelinePicker';

export {convertTimeToRequestParams, formatInterval} from './util';

import i18n from './i18n';

function shortcut(time: string, title?: string) {
    return {time, title: title || time};
}

export const TIMELINE_RANGE_PICKER_SHORTCUTS = [
    [shortcut('4h'), shortcut('8h'), shortcut('12h'), shortcut('24h')],
    [shortcut('2d'), shortcut('7d', i18n('label_week')), shortcut('2w', i18n('label_2-weeks'))],
    [shortcut('1M', i18n('label_month')), shortcut('2M', i18n('label_2-months'))],
];
