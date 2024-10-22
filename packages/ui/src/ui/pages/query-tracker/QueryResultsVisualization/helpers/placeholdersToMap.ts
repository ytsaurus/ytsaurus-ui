import {Placeholder} from '../types';

export const placeholdersToMap = (placeholders: Placeholder[]) => {
    return new Map(placeholders.map((placeholder) => [placeholder.id, placeholder.field]));
};
