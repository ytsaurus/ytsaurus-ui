import {replaceDomainForSetCookie} from './cookie';

describe('replaceSetCookieDomain', () => {
    it('should replace an existing Domain attribute (exact case)', () => {
        const result = replaceDomainForSetCookie(
            'foo=bar; Domain=old.example.com; Path=/',
            'new.example.com',
        );
        expect(result).toBe('foo=bar; Domain=new.example.com; Path=/');
    });

    it('should replace an existing Domain attribute (lowercase)', () => {
        const result = replaceDomainForSetCookie(
            'foo=bar; domain=old.example.com; Path=/',
            'new.example.com',
        );
        expect(result).toBe('foo=bar; Domain=new.example.com; Path=/');
    });

    it('should replace an existing Domain attribute (mixed case)', () => {
        const result = replaceDomainForSetCookie(
            'foo=bar; DoMaIn=old.example.com; Path=/',
            'new.example.com',
        );
        expect(result).toBe('foo=bar; Domain=new.example.com; Path=/');
    });

    it('should append Domain attribute when it is absent', () => {
        const result = replaceDomainForSetCookie('foo=bar; Path=/; HttpOnly', 'new.example.com');
        expect(result).toBe('foo=bar; Path=/; HttpOnly; Domain=new.example.com');
    });

    it('should append Domain attribute to a cookie string with no other attributes', () => {
        const result = replaceDomainForSetCookie('foo=bar', 'example.com');
        expect(result).toBe('foo=bar; Domain=example.com');
    });

    it('should handle a cookie string that already has only a Domain attribute', () => {
        const result = replaceDomainForSetCookie(
            'foo=bar; Domain=old.example.com',
            'new.example.com',
        );
        expect(result).toBe('foo=bar; Domain=new.example.com');
    });

    it('should handle semicolons with varying whitespace between parts', () => {
        const result = replaceDomainForSetCookie(
            'foo=bar;Domain=old.example.com;Path=/',
            'new.example.com',
        );
        expect(result).toBe('foo=bar; Domain=new.example.com; Path=/');
    });

    it('should not modify other attributes when replacing Domain', () => {
        const result = replaceDomainForSetCookie(
            'session=abc123Domain=old.example.com; Domain=old.example.com; Path=/; Secure; HttpOnly; SameSite=Strict',
            'new.example.com',
        );
        expect(result).toBe(
            'session=abc123Domain=old.example.com; Domain=new.example.com; Path=/; Secure; HttpOnly; SameSite=Strict',
        );
    });

    it('should not modify other attributes when appending Domain', () => {
        const result = replaceDomainForSetCookie(
            'session=abc123; Path=/; Secure; HttpOnly; SameSite=Strict',
            'new.example.com',
        );
        expect(result).toBe(
            'session=abc123; Path=/; Secure; HttpOnly; SameSite=Strict; Domain=new.example.com',
        );
    });
});
