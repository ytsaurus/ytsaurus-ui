import {type PrometheusDashboardUnitType} from '../../../../shared/prometheus/types';
import format from '../../../common/hammer/format';

export type ValueFormatterFn = (v: number | string | null) => string;

export function getPrometheusFormatter(
    unit: PrometheusDashboardUnitType | string | undefined,
): ValueFormatterFn {
    switch (unit) {
        case 'bytes':
        case 'decbytes':
        case 'decmbytes':
            return format.Bytes;
        case 'gbytes':
            return formatGBytes;
        case 'Bps':
            return (v: number | string | null) => format.Bytes(v) + '/s';
        case 'iops':
            return (v: number | string | null) => format.NumberSmart(v) + 'io/s';
        default:
            return format.NumberSmart;
    }
}

function formatGBytes(value: number | string | null) {
    const NAMES = [' GiB', ' TiB', ' PiB', ' EiB'];

    return format.FormatWithSuffixes({value, NAMES, DIVIDER: 1024, digits: 2});
}
