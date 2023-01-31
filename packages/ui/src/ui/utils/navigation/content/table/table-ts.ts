import _ from 'lodash';

export function injectColumnsFromSchema(
    columns: Array<string>,
    omittedColumns: Array<string>,
    schemaColumns: Array<string>,
) {
    const toSkip = _.reduce(
        _.concat(columns, omittedColumns),
        (acc, column) => {
            acc[column] = true;
            return acc;
        },
        {} as {[column: string]: true},
    );
    const toAdd = _.reduce(
        schemaColumns,
        (acc, col) => {
            if (!toSkip[col]) {
                acc.push(col);
            }
            return acc;
        },
        [] as Array<string>,
    );
    return _.concat(columns, toAdd);
}
