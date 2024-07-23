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

export default class Query {
    // What if key_column name has unicode symbols ->
    // we won't be able to load attributes (the problem will reveal itself on prev step)
    static prepareColumns(columns) {
        const selector = map_(columns, (column) => {
            return ESCAPE_START + (column.name || column) + ESCAPE_END;
        }).join(SEPARATOR + DELIMITER);

        return selector ? selector : '*';
    }

    static prepareColumnValue(value, yqlTypes) {
        const settings = {
            format: 'yson',
            break: false,
            indent: 0,
            asHTML: false,
        };
        if (!yqlTypes || !value) {
            return unipika.formatFromYSON(value, settings);
        }

        const yqlValue = [value[0], yqlTypes[Number(value[1])]];
        return unipika.formatFromYQL(yqlValue, settings);
    }

    static prepareKey(key, yqlTypes) {
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

    static prepareOffset(offsetColumns, offsetKey, descending) {
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

    static prepareOrder(keyColumns, descending) {
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

    static prepareQuery(parameters) {
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
