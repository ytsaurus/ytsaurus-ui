import {NAMESPACES} from '../../../shared/constants/settings';
import {createNestedNS} from '../../../shared/utils/settings';
const ODIN = createNestedNS('odin', NAMESPACES.GLOBAL);

export const ODIN_VISIBLE_METRIC_PRESETS = 'visibleMetricPresets';
export const ODIN_LAST_VISITED_TAB = 'lastVisitedTab';

export const YA_NAMESPACES = {ODIN};
