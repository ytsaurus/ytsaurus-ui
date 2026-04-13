import axios from 'axios';
import {type Request, type Response} from 'express';
import {Readable, Writable} from 'node:stream';

import {getYTApiClusterSetup} from '../components/requestsSetup';
import {handleLogin} from './login';

jest.mock('axios');
jest.mock('@ytsaurus/javascript-wrapper', () => jest.fn(() => ({})));
jest.mock('../components/requestsSetup', () => ({
    getYTApiClusterSetup: jest.fn(),
}));

const axiosRequestMock = jest.mocked(axios.request);
const getYTApiClusterSetupMock = jest.mocked(getYTApiClusterSetup);

function makeRequest(authCookieDomain?: string) {
    return {
        body: JSON.stringify({username: 'user', password: 'password'}),
        method: 'POST',
        params: {ytAuthCluster: 'alpha'},
        headers: {},
        ctx: {
            config: {authCookieDomain},
            getMetadata: jest.fn(() => ({})),
            log: jest.fn(),
            logError: jest.fn(),
        },
    } as unknown as Request;
}

function makeResponse() {
    const headers = new Map<string, string | string[]>();
    const res = new Writable({
        write(_chunk, _encoding, callback) {
            callback();
        },
    }) as unknown as Response;

    res.status = jest.fn(() => res);
    res.setHeader = (name, value) => {
        headers.set(name.toLowerCase(), value as string | string[]);
        return res;
    };
    res.getHeader = (name) => headers.get(name.toLowerCase());

    return res;
}

describe('handleLogin', () => {
    beforeEach(() => {
        getYTApiClusterSetupMock.mockReturnValue({
            proxyBaseUrl: 'https://alpha.example.com',
            setup: {} as ReturnType<typeof getYTApiClusterSetup>['setup'],
        });
    });

    it('should return the main and cluster auth cookies with the configured domain', async () => {
        axiosRequestMock.mockResolvedValue({
            data: Readable.from(['ok']),
            headers: {
                'set-cookie': [
                    'YTCypressCookie=secret; Path=/; Secure; HttpOnly',
                    'unrelated=value; Path=/',
                ],
            },
            status: 200,
        });
        const res = makeResponse();

        await handleLogin(makeRequest('.example.com'), res);

        expect(res.getHeader('set-cookie')).toEqual([
            'YTCypressCookie=secret; Path=/; Secure; HttpOnly; Domain=.example.com',
            'alpha_YTCypressCookie=secret; Path=/; Secure; HttpOnly; Domain=.example.com',
            'unrelated=value; Path=/',
        ]);
    });

    it('should preserve host-only auth cookies when the domain is not configured', async () => {
        axiosRequestMock.mockResolvedValue({
            data: Readable.from(['ok']),
            headers: {'set-cookie': ['YTCypressCookie=secret; Path=/; Secure; HttpOnly']},
            status: 200,
        });
        const res = makeResponse();

        await handleLogin(makeRequest(), res);

        expect(res.getHeader('set-cookie')).toEqual([
            'YTCypressCookie=secret; Path=/; Secure; HttpOnly',
            'alpha_YTCypressCookie=secret; Path=/; Secure; HttpOnly',
        ]);
    });
});
