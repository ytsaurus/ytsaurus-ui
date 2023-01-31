import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {RumWrapper} from '../../../../../rum/rum-wrap-api';

export function makeTableRumId({cluster, isDynamic}: {cluster: string; isDynamic: boolean}) {
    const measureId = isDynamic
        ? RumMeasureTypes.NAVIGATION_CONTENT_TABLE_DYNAMIC
        : RumMeasureTypes.NAVIGATION_CONTENT_TABLE_STATIC;
    return new RumWrapper(cluster, measureId);
}
