import {PathAttribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';

import i18n from './i18n';

const TOOLTIP_MAP: Record<PathAttribute, string> = {
    [PathAttribute.COMPRESSION_CODEC]: i18n('context_compression-codec-tooltip'),
    [PathAttribute.ERASURE_CODEC]: i18n('context_erasure-codec-tooltip'),
    [PathAttribute.OPTIMIZE_FOR]: i18n('context_optimize-for-tooltip'),
};

export const getTooltipByType = (type: string) =>
    type in TOOLTIP_MAP ? TOOLTIP_MAP[type as PathAttribute] : undefined;
