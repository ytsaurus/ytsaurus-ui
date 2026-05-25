import {NavigationTableData, NavigationTableSchema} from '../../../types';

export const sortColumnsBySchema = (
    columns: NavigationTableData['columns'],
    schema: NavigationTableSchema[],
) => {
    const schemaOrder = new Map(schema.map(({name}, index) => [name, index]));

    return columns
        .map((name, index) => ({name, index}))
        .sort((a, b) => {
            const schemaIndexA = schemaOrder.get(a.name);
            const schemaIndexB = schemaOrder.get(b.name);

            if (schemaIndexA !== undefined && schemaIndexB !== undefined) {
                return schemaIndexA - schemaIndexB;
            }

            if (schemaIndexA !== undefined) return -1;
            if (schemaIndexB !== undefined) return 1;

            return a.index - b.index;
        })
        .map(({name}) => name);
};
