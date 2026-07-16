import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';

import unipika from '../../../../common/thor/unipika';

const FROM = 'FROM';
const LIMIT = 'LIMIT';
const WHERE = 'WHERE';
const ORDER_BY = 'ORDER BY';
const ASCENDING_ORDER = 'ASC';
const DESCENDING_ORDER = 'DESC';
const DELIMITER = ' ';
const ESCAPE_START = '[';
const ESCAPE_END = ']';
const KEY_START = '(';
const KEY_END = ')';
const GREATER_THAN_OR_EQUAL = '>=';
const LESS_THAN_OR_EQUAL = '<=';
const SEPARATOR = ',';

type Column = {name?: string} | string;

type UnipikaSettings = {
    format: 'yson';
    break: boolean;
    indent: number;
    asHTML: boolean;
    treatValAsData: boolean;
};

// A YQL value is a tuple [data, type-index] where the type-index refers to a
// position in the accompanying yqlTypes array.
type YqlRawValue = [unknown, number];
type ColumnValue = YqlRawValue | unknown;

export interface QueryParameters {
    path: string;
    columns: Column[];
    keyColumns: string[];
    offsetColumns: string[];
    /** Pre-formatted offset key string, e.g. "(5, 42)". Pass null/undefined for first page. */
    offset: string | null | undefined;
    limit: number;
    orderBySupported: boolean;
    descending?: boolean;
}

export default class Query {
    // What if key_column name has unicode symbols ->
    // we won't be able to load attributes (the problem will reveal itself on prev step)
    static prepareColumns(columns: Column[]): string {
        const selector = map_(columns, (column) => {
            return (
                ESCAPE_START +
                (typeof column === 'string' ? column : (column.name ?? column)) +
                ESCAPE_END
            );
        }).join(SEPARATOR + DELIMITER);

        return selector || '*';
    }

    static prepareColumnValue(value: ColumnValue, yqlTypes: string[] | undefined): string {
        const settings: UnipikaSettings = {
            format: 'yson',
            break: false,
            indent: 0,
            asHTML: false,
            treatValAsData: true,
        };

        if (yqlTypes === null || yqlTypes === undefined || value === null || value === undefined) {
            return unipika.formatFromYSON(value, settings);
        }

        const [data, typeIndex] = value as YqlRawValue;
        const yqlValue: [unknown, string] = [data, yqlTypes[Number(typeIndex)]];
        return unipika.formatFromYQL(yqlValue, settings);
    }

    static prepareKey(key: ColumnValue[], yqlTypes: string[] | undefined): string {
        if (isEmpty_(key)) {
            return '';
        }
        return (
            KEY_START +
            map_(key, (columnValue) => {
                return typeof columnValue === 'string'
                    ? columnValue
                    : Query.prepareColumnValue(columnValue, yqlTypes);
            }).join(SEPARATOR + DELIMITER) +
            KEY_END
        );
    }

    static prepareOffset(offsetColumns: string[], offsetKey: string, descending: boolean): string {
        return (
            KEY_START +
            map_(offsetColumns, (columnName) => {
                return ESCAPE_START + columnName + ESCAPE_END;
            }).join(SEPARATOR + DELIMITER) +
            KEY_END +
            DELIMITER +
            (descending ? LESS_THAN_OR_EQUAL : GREATER_THAN_OR_EQUAL) +
            DELIMITER +
            offsetKey
        );
    }

    static prepareOrder(keyColumns: string[], descending: boolean): string {
        return map_(keyColumns, (columnName) => {
            return (
                ESCAPE_START +
                columnName +
                ESCAPE_END +
                DELIMITER +
                (descending ? DESCENDING_ORDER : ASCENDING_ORDER)
            );
        }).join(SEPARATOR + DELIMITER);
    }

    static prepareQuery(parameters: QueryParameters): string {
        const {
            path,
            columns,
            keyColumns,
            offsetColumns,
            offset,
            limit,
            orderBySupported,
            descending = false,
        } = parameters;

        const orderByClause = orderBySupported
            ? ORDER_BY + DELIMITER + Query.prepareOrder(keyColumns, descending) + DELIMITER
            : '';

        return (
            Query.prepareColumns(columns) +
            DELIMITER +
            FROM +
            DELIMITER +
            ESCAPE_START +
            path +
            ESCAPE_END +
            DELIMITER +
            (offset
                ? WHERE +
                  DELIMITER +
                  Query.prepareOffset(offsetColumns, offset, descending) +
                  DELIMITER
                : '') +
            orderByClause +
            LIMIT +
            DELIMITER +
            limit
        );
    }
}
