import {NavigationTableSchema} from '../../../types';

const filterValueInText = (value: string, filter: string) =>
    value.toLowerCase().includes(filter.toLowerCase());

export const filterSchema = (schema: NavigationTableSchema[], filter: string) => {
    if (!filter) return schema;

    return schema.filter(({name, type}) => {
        return filterValueInText(name, filter) || filterValueInText(type, filter);
    });
};
