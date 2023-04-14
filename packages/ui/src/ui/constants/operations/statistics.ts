import {createPrefix} from '../../constants/utils';
import {makeRadioButtonProps} from '../../utils';
import {Tab} from '../../constants/operations/detail';

const PREFIX = createPrefix('operations', Tab.STATISTICS);

export const SET_TREE_STATE = `${PREFIX}SET_TREE_STATE` as const;
export const CHANGE_FILTER_TEXT = `${PREFIX}CHANGE_FILTER_TEXT` as const;
export const CHANGE_AGGREGATION = `${PREFIX}CHANGE_AGGREGATION` as const;
export const OPERATION_STATISTICS_PARTIAL = `${PREFIX}PARTIAL` as const;

export const STATISTICS_FILTER_ALL_VALUE = '';

export const AGGREGATOR_OPTIONS = ['avg', 'min', 'max', 'sum', 'count'];
export const DEBOUNCE_DELAY = 500;
export const NAME_TERMINATOR = '$$';
export const TREE_ROOT_NAME = '<Root>';
export const TREE_STATE = {
    EXPANDED: 'expanded',
    COLLAPSED: 'collapsed',
    MIXED: 'mixed',
} as const;

export const AGGREGATOR_RADIO_ITEMS = makeRadioButtonProps(AGGREGATOR_OPTIONS);
