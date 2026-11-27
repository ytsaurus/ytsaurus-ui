import {getContentDispositionFilename} from './getContentDispositionFilename';

describe('getContentDispositionFilename', () => {
    it.each([
        ['attachment; filename="foo-bar_123.log"', 'foo-bar_123.log'],
        ['attachment; filename=foo-bar_123.log', 'foo-bar_123.log'],
        ['attachment; filename="foo-bar_123.log"; size=2048', 'foo-bar_123.log'],
        ['attachment; filename=foo-bar_123.log; size=2048', 'foo-bar_123.log'],
    ])('extracts the filename from %s', (header, filename) => {
        expect(getContentDispositionFilename(header)).toBe(filename);
    });

    it.each([
        'attachment',
        'attachment; filename="foobar',
        'attachment; filename=" foobar"',
        'attachment; filename="nested/foobar"',
        'attachment; filename*="foobar"',
    ])('returns undefined for %s', (header) => {
        expect(getContentDispositionFilename(header)).toBeUndefined();
    });
});
