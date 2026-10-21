import type {QuerySettingsAttribute} from '@gravity-ui/querieskit';
import type {DraftQuery} from '../../../../types/query-tracker/api';

export function applySettingsAttributes(
    settings: DraftQuery['settings'],
    previous: QuerySettingsAttribute[],
    next: QuerySettingsAttribute[],
): DraftQuery['settings'] {
    return Object.fromEntries(
        next.map((attribute) => {
            const old = previous.find(({id}) => id === attribute.id);
            // Unchanged values may be numbers, booleans or nested objects from the API.
            const value =
                old && old.value === attribute.value ? settings?.[old.key] : attribute.value;
            return [attribute.key, value];
        }),
    );
}

export function getSettingsAttributes(
    settings: DraftQuery['settings'],
    ids: Record<string, string>,
): QuerySettingsAttribute[] {
    const usedIds = new Set(Object.values(ids));
    return Object.entries(settings || {}).map(([key, value]) => {
        let id = Object.prototype.hasOwnProperty.call(ids, key) ? ids[key] : undefined;
        if (id === undefined) {
            id = key;
            while (usedIds.has(id)) id = `_${id}`;
        }
        usedIds.add(id);
        return {id, key, value: String(value)};
    });
}
