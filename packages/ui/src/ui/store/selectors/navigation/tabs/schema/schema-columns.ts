import i18n from './i18n';

const SCHEMA_ALL_COLUMNS = [
    'name',
    'type',
    'type_v3',
    'sort_order',
    'lock',
    'expression',
    'aggregate',
    'required',
    'group',
] as const;

type SchemaColumnName = (typeof SCHEMA_ALL_COLUMNS)[number];

export function getSchemaColumnName(name: SchemaColumnName) {
    return i18n(`column_${name}`);
}
