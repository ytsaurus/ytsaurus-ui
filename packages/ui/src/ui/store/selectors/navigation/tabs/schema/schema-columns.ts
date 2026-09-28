import i18n from './i18n';

type SchemaColumnName =
    | 'name'
    | 'type'
    | 'type_v3'
    | 'sort_order'
    | 'lock'
    | 'expression'
    | 'aggregate'
    | 'required'
    | 'group';

export function getSchemaColumnName(name: SchemaColumnName) {
    return i18n(`column_${name}`);
}
