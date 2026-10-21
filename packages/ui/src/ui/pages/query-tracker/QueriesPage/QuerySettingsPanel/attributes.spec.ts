import {applySettingsAttributes, getSettingsAttributes} from './attributes';

describe('native query settings adapter', () => {
    const settings = {
        cluster: 'test',
        limit: 100,
        enabled: false,
        nested: {timeout: 30},
        text: 'old',
    };
    it('preserves untouched non-string values when changing a different setting', () => {
        const previous = getSettingsAttributes(settings, {});
        const next = previous.map((row) => (row.key === 'text' ? {...row, value: 'new'} : row));
        const result = applySettingsAttributes(settings, previous, next);
        expect(result).toEqual({...settings, text: 'new'});
        expect(result?.nested).toBe(settings.nested);
    });
    it('renames, removes and adds attributes without retaining old keys', () => {
        const previous = getSettingsAttributes(settings, {});
        const next = previous
            .filter(({key}) => key !== 'enabled')
            .map((row) => (row.key === 'limit' ? {...row, key: 'count'} : row));
        next.push({id: 'new', key: 'extra', value: 'value'});
        expect(applySettingsAttributes(settings, previous, next)).toEqual({
            cluster: 'test',
            count: 100,
            nested: settings.nested,
            text: 'old',
            extra: 'value',
        });
    });
    it('keeps row identity after rename, even if the old key is reintroduced externally', () => {
        const rows = getSettingsAttributes({old: 'new', renamed: 'original'}, {renamed: 'old'});
        expect(rows.find(({key}) => key === 'renamed')?.id).toBe('old');
        expect(new Set(rows.map(({id}) => id)).size).toBe(2);
    });
    it('accepts keys that match Object prototype properties', () => {
        expect(getSettingsAttributes({constructor: 'value', toString: 'text'}, {})).toEqual([
            {id: 'constructor', key: 'constructor', value: 'value'},
            {id: 'toString', key: 'toString', value: 'text'},
        ]);
    });
    it('keeps an explicitly edited numeric value as a string, like the existing form', () => {
        const previous = getSettingsAttributes({limit: 100}, {});
        expect(
            applySettingsAttributes({limit: 100}, previous, [{...previous[0], value: '200'}]),
        ).toEqual({limit: '200'});
    });
});
