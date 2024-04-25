import {PathAttribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';

const TOOLTIP_MAP: Record<PathAttribute, string> = {
    [PathAttribute.COMPRESSION_CODEC]:
        'Sets the compression format for output table. The attribute can be specified with the write_file, write_table commands, and on operation output paths. This attribute is incompatible with <append=true>.',
    [PathAttribute.ERASURE_CODEC]:
        'Turn off erasure-coding to create a table. The attribute can be monitored with the write_file, write_table commands, and on operation output paths. This attribute is incompatible with <append=true>.',
    [PathAttribute.OPTIMIZE_FOR]:
        'Sets the storage format for output table. The attribute can be specified with the write_table command and on the output paths of operations. This attribute is not compatible with <append=true>.',
};

export const getTooltipByType = (type: string) =>
    type in TOOLTIP_MAP ? TOOLTIP_MAP[type as PathAttribute] : undefined;
