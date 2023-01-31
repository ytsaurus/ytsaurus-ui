import _ from 'lodash';
import unipika from '../../../../common/thor/unipika';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../../../common/hammer';
import {sortItemsBySchema} from '../../../../utils/sort-helpers';

const CAPTION_PRINT_SETTINGS = {
    indent: 0,
    break: false,
};
const TITLE_PRINT_SETTINGS = {asHTML: false, ...CAPTION_PRINT_SETTINGS};
const INDEX_KEY_COLUMNS = ['$tablet_index', '$row_index'];

export default class Columns {
    static unescapeSpecialColumn(columnName) {
        return columnName.replace(/^\$\$/, '$');
    }

    static prepareColumnCaption(columnName) {
        return unipika.prettyprint(columnName, CAPTION_PRINT_SETTINGS);
    }

    static prepareColumnTitle(columnName) {
        return unipika.prettyprint(columnName, TITLE_PRINT_SETTINGS);
    }

    static getColumnsFromRows(rows) {
        let columns;

        columns = _.map(rows, (row) => _.map(_.keys(row), Columns.unescapeSpecialColumn));
        columns = _.union.apply(null, columns);

        return _.map(columns, (column) => column);
    }

    static _makeIsKeyColumn(meta) {
        const keyColumnNames = Columns.getKeyColumns(meta);

        return function isKeyColumn(column) {
            return _.includes(keyColumnNames, column);
        };
    }

    static isColumnSpecial(column) {
        return column.startsWith('$');
    }

    static escapeSpecialColumn(columnName) {
        return columnName.replace(/^\$([^$].*)/, '$$$$$1');
    }

    static sortColumns(predifinedOrder, columns, property) {
        // order is predefined by loadedColumns or schema;
        // all columns that are members of the above lists appear in that order;
        // other columns are sorted alphabetically;
        return hammer.utils.sortInPredefinedOrder(predifinedOrder, columns, property);
    }

    static getKeyColumns(meta) {
        const [dynamic, sorted, keyColumns] = ypath.getValues(meta, [
            '/dynamic',
            '/sorted',
            '/key_columns',
        ]);

        if (dynamic && !sorted) {
            return INDEX_KEY_COLUMNS.concat(keyColumns);
        }

        return keyColumns;
    }

    static getSchemaColumns(meta) {
        const schema = ypath.getValue(meta, '/schema');

        return _.map(schema, 'name');
    }

    static getColumnsOrder(columns) {
        return _.map(columns, (column) => column.name);
    }

    static orderColumns(columns, columnsOrder) {
        return columns.sort((a, b) => columnsOrder.indexOf(a.name) - columnsOrder.indexOf(b.name));
    }

    static prepareColumns(meta, rows, allColumns, storedColumns, defaultTableColumnLimit) {
        const isKeyColumn = Columns._makeIsKeyColumn(meta);

        const isDynamic = ypath.getValue(meta, '/dynamic');
        const isSorted = ypath.getValue(meta, '/sorted');

        let columns = Columns.getColumnsFromRows(rows);

        if (isDynamic && !isSorted) {
            columns = columns.concat(INDEX_KEY_COLUMNS);
        }

        // Additional columns extracted from webJson format
        if (allColumns) {
            columns = _.uniq(columns.concat(allColumns));
        }

        const storedColumnsMap = _.reduce(
            storedColumns,
            (storedColumnsMap, column) => {
                storedColumnsMap[column.name] = column;
                return storedColumnsMap;
            },
            {},
        );

        const schemaColumnsByName = _.reduce(
            ypath.getValue(meta, '/schema'),
            (acc, colItem) => {
                acc[colItem.name] = colItem;
                return acc;
            },
            {},
        );

        columns = _.map(columns, (column) => {
            const columnSpec = {
                name: column,
                data: {
                    caption: Columns.prepareColumnCaption(column),
                    title: Columns.prepareColumnTitle(column),
                },
                keyColumn: isKeyColumn(column),
                sortOrder: schemaColumnsByName[column]?.sort_order,
                disabled: false,
                checked: Object.hasOwnProperty.call(storedColumnsMap, column)
                    ? storedColumnsMap[column].checked
                    : false,
            };

            if (Columns.isColumnSpecial(column)) {
                const cellName = Columns.escapeSpecialColumn(column);
                columnSpec.accessor = (row) => row[cellName];
            }

            return columnSpec;
        });

        // Make sure that key columns come first
        const schemaColumns = Columns.getSchemaColumns(meta);
        const [keyColumns, regularColumns] = _.partition(columns, (column) => column.keyColumn);
        Columns.sortColumns(
            storedColumns ? _.map(storedColumns, 'name') : schemaColumns,
            regularColumns,
            'name',
        );

        Columns.sortColumns(Columns.getKeyColumns(meta), keyColumns, 'name');
        columns = keyColumns.concat(regularColumns);

        // if storedColumns is not exist that make visible first *defaultTableColumnLimit* columns
        if (!storedColumns) {
            let column = 0;

            while (column < defaultTableColumnLimit && column < columns.length) {
                columns[column].checked = true;
                column++;
            }
        }

        return columns;
    }

    static prepareOmittedColumns(meta, omittedColumns) {
        const isKeyColumn = Columns._makeIsKeyColumn(meta);

        return _.map(omittedColumns, (column) => ({
            name: column,
            data: {
                caption: Columns.prepareColumnCaption(column),
                title: Columns.prepareColumnTitle(column),
            },
            keyColumn: isKeyColumn(column),
            label: 'Access denied',
            checked: false,
            disabled: true,
        }));
    }

    static prepareSrcColumns(meta, viewAllColumns = []) {
        const schema = ypath.getValue(meta, '/schema');

        return sortItemsBySchema([...viewAllColumns], schema);
    }

    // Columns keys are stored/restored in runtime:
    // similar tables show similar checked/unchecked columns and column order
    static restoreSimilarColumns(meta, allColumns) {
        const isKeyColumn = Columns._makeIsKeyColumn(meta);

        return hammer.tables.loadSimilarKeys(
            _.map(allColumns, (name) => ({
                name,
                keyColumn: isKeyColumn(name),
            })),
        );
    }

    static restoreExactColumns(meta) {
        const [id, schema] = ypath.getValues(meta, ['/id', '/schema']);

        return hammer.tables.loadKeys(id, schema);
    }

    // Even if table similarity is switched off, store similarity data for use when the setting is turned on
    static storeAllColumns(meta, columns) {
        const serializedColumns = _.map(columns, (value) => {
            const {checked, keyColumn, name} = value;
            return {checked, name, keyColumn};
        });
        const [id, schema] = ypath.getValues(meta, ['/id', '/schema']);

        hammer.tables.saveKeys(id, schema, serializedColumns);
        hammer.tables.saveSimilarKeys(serializedColumns);
    }
}
