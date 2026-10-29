import type {QuerySettingsAttribute} from '@gravity-ui/querieskit';
import type {DraftQuery} from '../../../../types/query-tracker/api';

export const settingsAttributeCodec = {
    format: String,
    parse: (text: string) => ({value: text}),
};

export function applySettingsAttributes(
    attributes: QuerySettingsAttribute<unknown>[],
): DraftQuery['settings'] {
    return Object.fromEntries(attributes.map(({key, value}) => [key, value]));
}

export function getSettingsAttributes(
    settings: DraftQuery['settings'],
    ids: Record<string, string>,
): QuerySettingsAttribute<unknown>[] {
    const usedIds = new Set(Object.values(ids));
    return Object.entries(settings || {}).map(([key, value]) => {
        let id = Object.prototype.hasOwnProperty.call(ids, key) ? ids[key] : undefined;
        if (id === undefined) {
            id = key;
            while (usedIds.has(id)) id = `_${id}`;
        }
        usedIds.add(id);
        return {id, key, value};
    });
}
