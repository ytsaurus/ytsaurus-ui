import concat_ from 'lodash/concat';
import reduce_ from 'lodash/reduce';

export function injectColumnsFromSchema(
    columns: Array<string>,
    omittedColumns: Array<string>,
    schemaColumns: Array<string>,
) {
    const toSkip = reduce_(
        concat_(columns, omittedColumns),
        (acc, column) => {
            acc[column] = true;
            return acc;
        },
        {} as {[column: string]: true},
    );
    const toAdd = reduce_(
        schemaColumns,
        (acc, col) => {
            if (!toSkip[col]) {
                acc.push(col);
            }
            return acc;
        },
        [] as Array<string>,
    );
    return concat_(columns, toAdd);
}
