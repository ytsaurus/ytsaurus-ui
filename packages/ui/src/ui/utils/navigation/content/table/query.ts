import {type TypeArray} from '@ytsaurus/components';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import unipika from '../../../../common/thor/unipika';

const ASCENDING_ORDER = 'ASC';
const DESCENDING_ORDER = 'DESC';

function wrap(type: 'square' | 'round', str: string): string {
    const [begin, end] = type === 'square' ? ['[', ']'] : ['(', ')'];
    return begin + str + end;
}

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

export type QueryParameters = {
    path: string;
    columns: Column[];
    keyColumns?: string[];
    limit: number;
    orderBySupported?: boolean;
    descending?: boolean;
} & QueryOffsetParameters;

export type QueryOffsetParameters =
    | {offset?: never; offsetColumns?: never}
    | {
          /** Pre-formatted offset key string, e.g. "(5, 42)". Pass null/undefined for first page. */
          offset: string;
          offsetColumns: Array<string>;
      };

export class Query {
    // What if key_column name has unicode symbols ->
    // we won't be able to load attributes (the problem will reveal itself on prev step)
    static prepareColumns(columns: Column[]): string {
        const selector = map_(columns, (column) => {
            return wrap(
                'square',
                typeof column === 'string' ? column : String(column.name ?? column),
            );
        }).join(', ');

        return selector || '*';
    }

    static prepareColumnValue(value: ColumnValue, yqlTypes?: TypeArray[] | null): string {
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
        const yqlValue = [data, yqlTypes[Number(typeIndex)]];
        return unipika.formatFromYQL(yqlValue, settings);
    }

    static prepareKey(key: ColumnValue[], yqlTypes?: TypeArray[] | null): string {
        if (isEmpty_(key)) {
            return '';
        }
        return prepareKeyImpl(
            map_(key, (columnValue) => {
                return typeof columnValue === 'string'
                    ? columnValue
                    : Query.prepareColumnValue(columnValue, yqlTypes);
            }),
        );
    }

    static prepareWhere(
        offsetColumns: string[],
        offsetKey: string,
        op: 'lq' | 'gq' | 'eq',
    ): string {
        const comparator = {
            lq: '<=',
            gq: '>=',
            eq: '=',
        }[op];
        return [
            wrap(
                'round',
                map_(offsetColumns, (columnName) => wrap('square', columnName)).join(', '),
            ),
            comparator,
            offsetKey,
        ].join(' ');
    }

    static prepareOrder(keyColumns?: string[], descending?: boolean): string {
        return map_(keyColumns, (columnName) => {
            return (
                wrap('square', columnName) + ' ' + (descending ? DESCENDING_ORDER : ASCENDING_ORDER)
            );
        }).join(', ');
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

        return [
            Query.prepareColumns(columns),
            `FROM ${wrap('square', path)}`,
            offset
                ? `WHERE ${Query.prepareWhere(offsetColumns, offset, descending ? 'lq' : 'gq')}`
                : '',
            orderBySupported ? `ORDER BY ${Query.prepareOrder(keyColumns, descending)}` : '',
            `LIMIT ${limit}`,
        ]
            .filter(Boolean)
            .join(' ');
    }

    static prepareQueryByKeys({
        path,
        columns,
        keyValues = {},
        limit,
    }: {
        path: string;
        columns: Array<string>;
        keyValues?: Record<string, unknown>;
        limit: number;
    }): string {
        const whereColumns = Object.keys(keyValues);
        const whereValues = Object.values(keyValues).map((v) => Query.prepareColumnValue(v));

        const key = prepareKeyImpl(whereValues);

        return [
            Query.prepareColumns(columns),
            `FROM ${wrap('square', path)}`,
            whereColumns.length > 0 ? `WHERE ${Query.prepareWhere(whereColumns, key, 'eq')}` : '',
            `LIMIT ${limit}`,
        ]
            .filter(Boolean)
            .join(' ');
    }
}

function prepareKeyImpl(keys: Array<string>) {
    if (isEmpty_(keys)) {
        return '';
    }
    return wrap('round', keys.join(', '));
}
