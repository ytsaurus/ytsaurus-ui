import express, {type Request, type Response} from 'express';

import {removeOAuthCookies, saveOAuthTokensInCookies} from './oauth';

const NOW = new Date('2026-08-14T12:00:00.000Z');

function makeRequest(authCookieDomain?: string) {
    return {ctx: {config: {authCookieDomain}}} as unknown as Request;
}

function makeResponse(req: Request) {
    const headers = new Map<string, string | string[]>();
    const res = Object.create(express.response) as Response;

    res.req = req;
    res.getHeader = (name) => headers.get(name.toLowerCase());
    res.setHeader = (name, value) => {
        headers.set(name.toLowerCase(), value as string | string[]);
        return res;
    };

    return res;
}

describe('OAuth auth Set-Cookie headers', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should set access and refresh cookies with the configured domain', () => {
        const req = makeRequest('.example.com');
        const res = makeResponse(req);

        saveOAuthTokensInCookies(req, res, {
            access_token: 'access-token',
            expires_in: 60,
            refresh_token: 'refresh-token',
            refresh_expires_in: 120,
        });

        expect(res.getHeader('set-cookie')).toEqual([
            'yt_oauth_access_token=access-token; Max-Age=60; Domain=.example.com; Path=/; Expires=Fri, 14 Aug 2026 12:01:00 GMT; HttpOnly; Secure',
            'yt_oauth_refresh_token=refresh-token; Max-Age=120; Domain=.example.com; Path=/; Expires=Fri, 14 Aug 2026 12:02:00 GMT; HttpOnly; Secure',
        ]);
    });

    it('should preserve a host-only access cookie when the domain is not configured', () => {
        const req = makeRequest();
        const res = makeResponse(req);

        saveOAuthTokensInCookies(req, res, {
            access_token: 'access-token',
            expires_in: 60,
            refresh_token: '',
            refresh_expires_in: 0,
        });

        expect(res.getHeader('set-cookie')).toBe(
            'yt_oauth_access_token=access-token; Max-Age=60; Path=/; Expires=Fri, 14 Aug 2026 12:01:00 GMT; HttpOnly; Secure',
        );
    });

    it('should expire both cookies with the configured domain', () => {
        const req = makeRequest('.example.com');
        const res = makeResponse(req);

        removeOAuthCookies(req, res);

        expect(res.getHeader('set-cookie')).toEqual([
            'yt_oauth_access_token=; Domain=.example.com; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'yt_oauth_refresh_token=; Domain=.example.com; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ]);
    });
});
