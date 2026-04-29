import {normalizePath} from './normalizePath';

describe('normalizePath', () => {
    test('returns root for empty input', () => {
        expect(normalizePath('')).toBe('/');
    });

    test('returns root for whitespace-only input', () => {
        expect(normalizePath('   ')).toBe('/');
    });

    test('returns root for slash-only input', () => {
        expect(normalizePath('////')).toBe('/');
    });

    test('adds a double leading slash to relative paths', () => {
        expect(normalizePath('home/path')).toBe('//home/path');
    });

    test('normalizes a single leading slash to a double leading slash', () => {
        expect(normalizePath('/home/path')).toBe('//home/path');
    });

    test('keeps an already normalized path unchanged', () => {
        expect(normalizePath('//home/path')).toBe('//home/path');
    });

    test('trims surrounding whitespace and trailing slashes', () => {
        expect(normalizePath('  /home/path///  ')).toBe('//home/path');
    });

    test('replaces any number of leading slashes with exactly two and preserves inner slashes', () => {
        expect(normalizePath('////home//nested/path///')).toBe('//home//nested/path');
    });
});
