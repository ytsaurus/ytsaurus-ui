import {type PrometheusDashboardUnitType} from '../../../../shared/prometheus/types';
import format from '../../../common/hammer/format';

export function getPrometheusFormatter(unit: PrometheusDashboardUnitType | unknown) {
    switch (unit) {
        case 'bytes':
        case 'decbytes':
        case 'decmbytes':
            return format.Bytes;
        case 'gbytes':
            return formatGBytes;
        case 'Bps':
            return (v: number) => format.Bytes(v) + '/s';
        case 'iops':
            return (v: number) => format.NumberSmart(v) + 'io/s';
        default:
            return format.NumberSmart;
    }
}

function formatGBytes(value: number | string | undefined) {
    const NAMES = [' GiB', ' TiB', ' PiB', ' EiB'];

    return format.FormatWithSuffixes({value, NAMES, DIVIDER: 1024, digits: 2});
}
