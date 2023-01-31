const yt = require('../lib')({ exportBrowserModule: false });

// TODO: use Jest
/*eslint-disable no-console*/

describe('yt', function () {
    var _yt;
    var _request;

    beforeEach(function (done) {
        _yt = yt;
        _request = _yt.core._request;

        done();
    });

    describe('API', function () {
        var PROXY = 'kant.yt.my-domain.com',
            OVERRIDEN_PROXY = 'plato.yt.my-domain.com',
            TIMEOUT = 42,
            OVERRIDEN_TIMEOUT = 314,
            DOMAIN_AUTHENTICATION = {
                type: 'domain',
            },
            OAUTH_AUTHENTICATION = {
                type: 'oauth',
                token: 'MY_TOKEN',
            },
            NO_AUTHENTICATION = {
                type: 'none',
            },
            GET_METHOD = 'GET',
            PATH = '//tmp/foo';

        var API_VERSION = 'v3';

        var HEADERS_FORMAT = '<encode_utf8=%false>json';

        var DEFAULT_HEADERS = {
            Accept: 'application/json',
            'X-YT-Header-Format': HEADERS_FORMAT,
            'X-YT-Suppress-Redirect': 1,
            'X-YT-Parameters-0': 'eyJwYXRoIjoiLy90bXAvZm9vIn0=', // { path: '//tmp/foo' }
        };

        beforeEach(function (done) {
            _yt.core._request = _yt.core._prepareRequestSettings;
            done();
        });

        var debugMode = false;

        function deeplyCompareAjaxParameters(
            actualParameters,
            expectedParameters
        ) {
            if (debugMode) {
                console.log('exp = ', expectedParameters);
                console.log('act = ', actualParameters);
            }

            expect(actualParameters).toEqual(expectedParameters);
        }

        it('supports shorthand and full syntax', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    path: PATH,
                }),
                _yt[API_VERSION].get({
                    parameters: {
                        path: PATH,
                    },
                })
            );

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].set(
                    {
                        path: PATH,
                    },
                    'Data'
                ),
                _yt[API_VERSION].set({
                    parameters: {
                        path: PATH,
                    },
                    data: 'Data',
                })
            );

            _yt.setup.unsetGlobalOption('proxy');
        });

        it('arguments validation, shorthand syntax', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);

            expect(function () {
                _yt[API_VERSION].get({
                    path: PATH,
                });
            }).not.toThrow();
            expect(function () {
                _yt[API_VERSION].get();
            }).toThrow(Error);
            expect(function () {
                _yt[API_VERSION].get(PATH);
            }).toThrow(Error);

            _yt.setup.unsetGlobalOption('proxy');
        });

        it('arguments validation, full syntax', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);

            expect(function () {
                _yt[API_VERSION].get({
                    parameters: {
                        path: PATH,
                    },
                });
            }).not.toThrow();
            expect(function () {
                _yt[API_VERSION].get({
                    parameters: PATH,
                });
            }).toThrow(Error);

            _yt.setup.unsetGlobalOption('proxy');
        });

        it('supports predefined proxy', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);

            deeplyCompareAjaxParameters(_yt[API_VERSION].get({ path: PATH }), {
                url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                headers: Object.assign({}, DEFAULT_HEADERS),
                timeout: _yt.setup.getDefaultOption('timeout'),
                responseType: 'json',
                method: GET_METHOD,
                withCredentials: false,
                transformResponse: [_yt.core._identity],
                xsrfCookieName: '',
                meta: { command: 'get' },
            });

            _yt.setup.unsetGlobalOption('proxy');
        });

        it('supports overriden proxy', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    setup: { proxy: OVERRIDEN_PROXY },
                    parameters: { path: PATH }
                }),
                {
                    url: 'https://' + OVERRIDEN_PROXY + '/api/' + API_VERSION + '/get',
                    headers: Object.assign({}, DEFAULT_HEADERS),
                    timeout: _yt.setup.getDefaultOption('timeout'),
                    responseType: 'json',
                    method: GET_METHOD,
                    withCredentials: false,
                    transformResponse: [_yt.core._identity],
                    xsrfCookieName: '',
                    meta: { command: 'get' },
                }
            );

            _yt.setup.unsetGlobalOption('proxy');
        });

        it('verifies that proxy is set', function () {
            expect(function () {
                _yt[API_VERSION].get({ path: PATH });
            }).toThrow(Error);
        });

        it('supports predefined authentication', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);
            _yt.setup.setGlobalOption('authentication', OAUTH_AUTHENTICATION);

            deeplyCompareAjaxParameters(_yt[API_VERSION].get({ path: PATH }), {
                url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                headers: Object.assign({}, DEFAULT_HEADERS, {
                    Authorization: 'OAuth ' + OAUTH_AUTHENTICATION.token,
                }),
                timeout: _yt.setup.getDefaultOption('timeout'),
                responseType: 'json',
                method: GET_METHOD,
                withCredentials: false,
                transformResponse: [_yt.core._identity],
                xsrfCookieName: '',
                meta: { command: 'get' },
            });

            _yt.setup.unsetGlobalOption('proxy');
            _yt.setup.unsetGlobalOption('authentication');
        });

        it('supports overriden authentication', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);
            _yt.setup.setGlobalOption('authentication', OAUTH_AUTHENTICATION);

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    setup: {
                        authentication: DOMAIN_AUTHENTICATION,
                    },
                    parameters: { path: PATH },
                }),
                {
                    url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                    headers: Object.assign({}, DEFAULT_HEADERS),
                    timeout: _yt.setup.getDefaultOption('timeout'),
                    responseType: 'json',
                    method: GET_METHOD,
                    withCredentials: true,
                    transformResponse: [_yt.core._identity],
                    xsrfCookieName: '',
                    meta: { command: 'get' },
                }
            );

            _yt.setup.unsetGlobalOption('proxy');
            _yt.setup.unsetGlobalOption('authentication');
        });

        it('supports no authentication', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);

            var EXPECTED_PARAMETERS = {
                url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                headers: Object.assign({}, DEFAULT_HEADERS),
                timeout: _yt.setup.getDefaultOption('timeout'),
                responseType: 'json',
                method: GET_METHOD,
                withCredentials: false,
                transformResponse: [_yt.core._identity],
                xsrfCookieName: '',
                meta: { command: 'get' },
            };

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    setup: {
                        authentication: NO_AUTHENTICATION,
                    },
                    parameters: { path: PATH },
                }),
                EXPECTED_PARAMETERS
            );

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({ path: PATH }),
                EXPECTED_PARAMETERS
            );

            _yt.setup.unsetGlobalOption('proxy');
        });

        it('supports predefined timeout', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);
            _yt.setup.setGlobalOption('timeout', TIMEOUT);

            deeplyCompareAjaxParameters(_yt[API_VERSION].get({ path: PATH }), {
                url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                headers: Object.assign({}, DEFAULT_HEADERS),
                timeout: TIMEOUT,
                responseType: 'json',
                method: GET_METHOD,
                withCredentials: false,
                transformResponse: [_yt.core._identity],
                xsrfCookieName: '',
                meta: { command: 'get' },
            });

            _yt.setup.unsetGlobalOption('proxy');
            _yt.setup.unsetGlobalOption('timeout');
        });

        it('supports overriden timeout', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);
            _yt.setup.setGlobalOption('timeout', TIMEOUT);

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    setup: {
                        timeout: OVERRIDEN_TIMEOUT,
                    },
                    parameters: { path: PATH },
                }),
                {
                    url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                    headers: Object.assign({}, DEFAULT_HEADERS),
                    timeout: OVERRIDEN_TIMEOUT,
                    responseType: 'json',
                    method: GET_METHOD,
                    withCredentials: false,
                    transformResponse: [_yt.core._identity],
                    xsrfCookieName: '',
                    meta: { command: 'get' },
                }
            );

            _yt.setup.unsetGlobalOption('proxy');
            _yt.setup.unsetGlobalOption('timeout');
        });

        it('supports predefined protocol', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);
            _yt.setup.setGlobalOption('secure', true);

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    parameters: { path: PATH },
                }),
                {
                    url: 'https://' + PROXY + '/api/' + API_VERSION + '/get',
                    headers: Object.assign({}, DEFAULT_HEADERS),
                    timeout: _yt.setup.getDefaultOption('timeout'),
                    responseType: 'json',
                    method: GET_METHOD,
                    withCredentials: false,
                    transformResponse: [_yt.core._identity],
                    xsrfCookieName: '',
                    meta: { command: 'get' },
                }
            );

            _yt.setup.unsetGlobalOption('proxy');
            _yt.setup.unsetGlobalOption('secure');
        });

        it('supports overriden protocol', function () {
            _yt.setup.setGlobalOption('proxy', PROXY);
            _yt.setup.setGlobalOption('secure', true);

            deeplyCompareAjaxParameters(
                _yt[API_VERSION].get({
                    setup: {
                        secure: false,
                    },
                    parameters: { path: PATH },
                }),
                {
                    url: 'http://' + PROXY + '/api/' + API_VERSION + '/get',
                    headers: Object.assign({}, DEFAULT_HEADERS),
                    timeout: _yt.setup.getDefaultOption('timeout'),
                    responseType: 'json',
                    method: GET_METHOD,
                    withCredentials: false,
                    transformResponse: [_yt.core._identity],
                    xsrfCookieName: '',
                    meta: { command: 'get' },
                }
            );

            _yt.setup.unsetGlobalOption('proxy');
            _yt.setup.unsetGlobalOption('secure');
        });

        afterEach(function (done) {
            _yt.core._request = _request;
            done();
        });
    });
});
