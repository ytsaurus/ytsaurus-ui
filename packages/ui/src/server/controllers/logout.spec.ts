import {type Request, type Response} from 'express';

import {getClustersFromConfig} from '../components/utils';
import {handleLogout} from './logout';

jest.mock('../components/utils', () => ({
    getClustersFromConfig: jest.fn(),
}));

const getClustersFromConfigMock = jest.mocked(getClustersFromConfig);

function makeRequest(authCookieDomain?: string) {
    return {
        cookies: {},
        ctx: {config: {allowPasswordAuth: true, authCookieDomain}},
    } as unknown as Request;
}

function makeResponse() {
    const headers = new Map<string, string | string[]>();
    const res = {
        getHeader: (name: string) => headers.get(name.toLowerCase()),
        setHeader: (name: string, value: string | string[]) => {
            headers.set(name.toLowerCase(), value);
        },
        redirect: jest.fn(),
    } as unknown as Response;

    return res;
}

describe('handleLogout', () => {
    beforeEach(() => {
        getClustersFromConfigMock.mockReturnValue({
            alpha: {
                id: 'alpha',
                name: 'Alpha',
                theme: 'bluejeans',
                environment: 'production',
                proxy: 'alpha.example.com',
            },
        });
    });

    it('should expire password auth cookies with the configured domain', () => {
        const res = makeResponse();

        handleLogout(makeRequest('.example.com'), res);

        expect(res.getHeader('set-cookie')).toEqual([
            'YTCypressCookie=deleted; Path=/; Max-Age=0; ; Domain=.example.com',
            'alpha_YTCypressCookie=deleted; Path=/; Max-Age=0; ; Domain=.example.com',
        ]);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('should preserve host-only password auth cookies when the domain is not configured', () => {
        const res = makeResponse();

        handleLogout(makeRequest(), res);

        expect(res.getHeader('set-cookie')).toEqual([
            'YTCypressCookie=deleted; Path=/; Max-Age=0;',
            'alpha_YTCypressCookie=deleted; Path=/; Max-Age=0;',
        ]);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});
