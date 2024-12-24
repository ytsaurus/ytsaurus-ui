import format from '../../common/hammer/format';

const UNIT_TO_FORMATTER: Record<string, undefined | ((v?: number, settings?: object) => string)> = {
    ['ms']: (v, settings) =>
        format.TimeDuration(Math.round(v!), {format: 'milliseconds', ...settings}),
    ['bytes']: (v, settings) => formatBytes(v, settings),
    ['bytes * sec']: (v, settings) => formatBytes(v, settings, ' * sec'),
    ['ms * bytes']: (v, settings) => formatBytes(v, settings, ' * ms'),
    ['Mb*sec']: (v, settings) => formatBytes(v! * 1024 * 1024, settings, ' * sec'),
};

function formatBytes(v?: number, settings?: object, suffix = '') {
    return isNaN(v!) ? format.NO_VALUE : format.Bytes(Math.round(v!), settings) + suffix;
}

export function formatByUnit(v?: number, unit?: string, settings?: object) {
    const formatFn = UNIT_TO_FORMATTER[unit!] ?? format.Number;
    return formatFn?.(v, settings);
}
