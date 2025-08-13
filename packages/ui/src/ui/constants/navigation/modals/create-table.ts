import {createPrefix} from '../../utils';
import {Page} from '../../index';

const PREFIX = createPrefix(Page.NAVIGATION);

export const CREATE_TABLE_MODAL_DATA_FIELDS = PREFIX + 'CREATE_TABLE_MODAL_DATA_FIELDS';

export const ERROR_DUPLICATE_COLUMN_NAME = 'The name must be unique';

// Select cannot handle empty string as value it suppose it as a missing value.
export const SELECT_EMPTY_VALUE = '_';

export const ColumnAggregateTypes = {
    SUM: 'sum',
    MIN: 'min',
    MAX: 'max',
    FIRST: 'first',
    XDELTA: 'xdelta',
};

export type ColumnAggregateType = 'sum' | 'min' | 'max' | 'first' | 'xdelta';

export const ColumnDataTypes = {
    INT64: 'int64',
    INT32: 'int32',
    INT16: 'int16',
    INT8: 'int8',
    UINT64: 'uint64',
    UINT32: 'uint32',
    UINT16: 'uint16',
    UINT8: 'uint8',
    DOUBLE: 'double',
    BOOLEAN: 'boolean',
    STRING: 'string',
    UTF8: 'utf8',
    DATE: 'date',
    DATETIME: 'datetime',
    TIMESTAMP: 'timestamp',
    INTERVAL: 'interval',
    ANY: 'any',
    YSON: 'yson',
};
