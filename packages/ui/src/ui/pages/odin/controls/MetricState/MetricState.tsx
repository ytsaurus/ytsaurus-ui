import {MetricData} from '../../../../pages/odin/odin-utils';
import i18n from './i18n';

export function MetricState({state}: Partial<Pick<MetricData, 'state'>>) {
    return metricsStateToText(state);
}

export function metricsStateToText(state?: MetricData['state']) {
    return i18n(`value_${state ?? 'no_data'}`);
}
