const axios = require('axios');

const useInterceptors = require('./utils/interceptors.js');
const meta = require('./utils/meta.js');
const setup = require('./utils/setup.js');
const error = require('./utils/error.js');
const commands = require('./commands/index.js');
const codes = require('./commands/codes.js');

const axiosInstance = useInterceptors(axios.create());

const core = {};

const subsriptions = {};

core.subscribe = function (name, callback) {
    subsriptions[name] = subsriptions[name] || [];

    const subscriptionIndex = subsriptions[name].indexOf(callback);

    if (subscriptionIndex === -1) {
        subsriptions[name].push(callback);
    }
};

core.unsubscribe = function (name, callback) {
    const subscriptionIndex = subsriptions[name].indexOf(callback);

    if (subscriptionIndex !== -1) {
        subsriptions[name].splice(subscriptionIndex, 1);
    }
};

core.notify = function (name, data) {
    if (subsriptions[name]) {
        subsriptions[name].forEach(function (callback) {
            callback(data);
        });
    }
};

core._makeSubscribable = function (yt) {
    yt.subscribe = core.subscribe;
    yt.unsubscribe = core.unsubscribe;
    yt.notify = core.notify;
};

function appendEncodedParameters(headers, localSetup, parameters) {
    const settings = setup.getOption(localSetup, 'encodedParametersSettings');
    const serializer = setup.getOption(localSetup, 'JSONSerializer');

    const encodedParameters = settings.encoder(serializer.stringify(parameters));

    if (encodedParameters.length > settings.maxCount * settings.maxSize) {
        throw new Error(error.prepare('Encoded parameters string is over size limit'));
    }

    let from = 0;
    let to = settings.maxSize;
    let index = 0;
    let chunk;

    while ((chunk = encodedParameters.slice(from, to)) !== '') {
        headers['X-YT-Parameters-' + index++] = chunk;
        from = to;
        to = from + settings.maxSize;
    }
}

function appendParametersHeaders(headers, localSetup, parameters) {
    const encode = setup.getOption(localSetup, 'useEncodedParameters');
    const serializer = setup.getOption(localSetup, 'JSONSerializer');

    if (encode) {
        appendEncodedParameters(headers, localSetup, parameters);

        headers['X-YT-Header-Format'] = '<encode_utf8=%false>json';
    } else {
        headers['X-YT-Parameters'] = serializer.stringify(parameters);
    }
}

function prepareProtocol(localSetup) {
    return setup.getOption(localSetup, 'secure') ? 'https://' : 'http://';
}

core._parseResponse = function (localSetup, data) {
    const serializer = setup.getOption(localSetup, 'JSONSerializer');

    if (typeof data === 'string') {
        try {
            data = serializer.parse(data);
        } catch (ex) {
            return data;
        }
    }
    return data;
};

core._makeSuccessHandler = function (localSetup) {
    return function (response) {
        core.notify('requestEnd', response.config);

        const data =
            response.config.responseType === 'json'
                ? core._parseResponse(localSetup, response.data)
                : response.data;

        const transformResponse =
            setup.getLocalOption(localSetup, 'transformResponse') ||
            (({parsedData}) => {
                return parsedData;
            });
        return transformResponse({parsedData: data, rawResponse: response});
    };
};

core._makeErrorHandler = function (localSetup) {
    return function (error) {
        core.notify('requestEnd', error.config);

        core.notify('error', error);

        const response = error.response;
        let data;

        if (response) {
            data = response.data;
        } else {
            data = {
                message: error.message,
                code: 0,
            };
        }

        const errorData = axios.isCancel(error)
            ? {code: codes.CANCELLED}
            : core._parseResponse(localSetup, data);

        const {['x-yt-request-id']: xYTRequestId, ['x-yt-trace-id']: xYTTraceId} =
            (response && response.headers) || {};

        Object.assign(errorData || {}, {yt_javascript_wrapper: {xYTRequestId, xYTTraceId}});

        const transformError =
            setup.getLocalOption(localSetup, 'transformError') ||
            (({parsedData}) => {
                throw parsedData;
            });
        return transformError({parsedData: errorData, rawError: error});
    };
};

core._prepareHeaders = function (localSetup, command, parameters) {
    const config = command.config;

    const headers = Object.assign({}, setup.getOption(localSetup, 'requestHeaders'), {
        Accept: 'application/json',
    });

    const authentication = setup.getOption(localSetup, 'authentication');

    if (authentication.type === 'oauth' && authentication.token) {
        headers['Authorization'] = 'OAuth ' + authentication.token;
    }

    if (parameters) {
        appendParametersHeaders(headers, localSetup, parameters);
    }

    if (config.method === 'PUT' || config.method === 'POST') {
        headers['Content-Type'] = 'application/json';
    }

    const useHeavyProxy = config.heavy && setup.getOption(localSetup, 'useHeavyProxy');

    if (!useHeavyProxy) {
        headers['X-YT-Suppress-Redirect'] = 1;
    }

    const remoteLocalProxy = setup.getOption(localSetup, 'remoteLocalProxy');
    if (remoteLocalProxy) {
        headers['X-YT-Remote-Local-Proxy'] = remoteLocalProxy;
    }

    return Object.assign(headers, config.headers);
};

core._prepareParameters = function (localSetup, command) {
    const config = command.config;

    return typeof config.prepareParameters === 'function'
        ? config.prepareParameters(command.parameters, localSetup)
        : command.parameters;
};

core._prepareURL = function (localSetup, command) {
    let proxy;
    const config = command.config;
    const protocol = prepareProtocol(localSetup);
    const apiVersion = config.version;
    const useHeavyProxy = config.heavy && setup.getOption(localSetup, 'useHeavyProxy');

    if (useHeavyProxy) {
        proxy = setup.getOption(localSetup, 'heavyProxy');
    } else {
        proxy = setup.getOption(localSetup, 'proxy');
    }

    return protocol + proxy + '/api/' + apiVersion + '/' + config.name;
};

core._prepareData = function (localSetup, command) {
    const config = command.config;
    const data = command.data;
    const serializer = setup.getOption(localSetup, 'JSONSerializer');

    if (config.method === 'POST' || config.method === 'PUT') {
        if (config.prepareData) return config.prepareData(localSetup, data);
        return serializer.stringify(data);
    }

    return data;
};

core._identity = function (data) {
    return data;
};

core._prepareRequestSettings = function (localSetup, command) {
    const proxy = setup.getOption(localSetup, 'proxy');

    if (typeof proxy === 'undefined') {
        throw new Error(error.prepare('cannot execute command - proxy was not configured.'));
    }

    const authentication = setup.getOption(localSetup, 'authentication');
    const timeout = setup.getOption(localSetup, 'timeout');
    const xsrfEnabled = setup.getOption(localSetup, 'xsrf');
    const xsrfCookieName = setup.getOption(localSetup, 'xsrfCookieName');
    const responseType = setup.getLocalOption(localSetup, 'dataType') || command.config.dataType;

    const preparedParameters = core._prepareParameters(localSetup, command);
    const {useBodyForParameters} = command.config;

    const withCredentials = Boolean(authentication.type) && authentication.type !== 'none';

    const requestParameters = Object.assign(
        {
            url: core._prepareURL(localSetup, command),
            headers: core._prepareHeaders(
                localSetup,
                command,
                useBodyForParameters ? undefined : preparedParameters,
            ),
            timeout: timeout,
            responseType: responseType,
            transformResponse: [core._identity],
            method: command.config.method,
            withCredentials,
            withXSRFToken: withCredentials,
            xsrfCookieName: '',
        },
        xsrfEnabled ? {xsrfCookieName: xsrfCookieName, xsrfHeaderName: 'X-Csrf-Token'} : undefined,
        command.config.bigUpload
            ? {
                  maxContentLength: Infinity,
                  maxBodyLength: Infinity,
                  timeout: 3600 * 24 * 1000,
              }
            : undefined,
    );

    meta.set(requestParameters, {
        command: command.config.name,
    });

    if (typeof command.data !== 'undefined') {
        requestParameters.data = core._prepareData(localSetup, command);
    }

    if (useBodyForParameters && preparedParameters) {
        if (requestParameters.data) {
            throw new Error('Unexpected behavior: Request body already defined');
        }
        const serializer = setup.getOption(localSetup, 'JSONSerializer');
        requestParameters.data = setup.encodeForYt(serializer.stringify(preparedParameters));
    }

    return requestParameters;
};

core._createRequestWithCancellation = function (localSetup, requestSettings, callback) {
    if (typeof callback === 'function') {
        const cancellation = axios.CancelToken.source();

        callback(cancellation);

        requestSettings = Object.assign(requestSettings, {cancelToken: cancellation.token});
    }

    // devToolsPublisher.publish({
    //     proxy: proxy,
    //     command: command,
    //     request: settings
    // });

    core.notify('requestStart');

    const onUploadProgress = setup.getOption(localSetup, 'onUploadProgress');

    return axiosInstance
        .request({
            onUploadProgress,
            ...requestSettings,
        })
        .then(core._makeSuccessHandler(localSetup))
        .catch(core._makeErrorHandler(localSetup));
};

core._getHeavyProxies = function (localSetup) {
    const proxy = setup.getOption(localSetup, 'proxy');
    const protocol = prepareProtocol(localSetup);

    return core._createRequestWithCancellation(localSetup, {
        url: protocol + proxy + '/hosts',
        responseType: 'json',
    });
};

core._request = function (localSetup, command) {
    const config = command.config;
    const proxy = setup.getOption(localSetup, 'proxy');

    if (typeof proxy === 'undefined') {
        throw new Error(error.prepare('cannot execute command - proxy was not configured.'));
    }

    // REQUESTING HEAVY PROXY FOR HEAVY REQUEST
    // XXX New proxy is requested every time, local parameters are ignored at the moment
    const useHeavyProxy = config.heavy && setup.getOption(localSetup, 'useHeavyProxy');
    if (useHeavyProxy) {
        return core._getHeavyProxies(localSetup).then(function (proxies) {
            setup.setGlobalOption('heavyProxy', proxies[0]);

            return core._createRequestWithCancellation(
                localSetup,
                core._prepareRequestSettings(localSetup, command),
                command.cancellation,
            );
        });
    }

    return core._createRequestWithCancellation(
        localSetup,
        core._prepareRequestSettings(localSetup, command),
        command.cancellation,
    );
};

core._initCommand = function (version, configuration, name) {
    /**
     * Execute command on yt cluster.
     *
     * Full syntax
     * @param {Object} settings
     * @param {Object} settings.parameters - command parameters
     * @param {Object} [settings.data] - command data
     * @param {Object} [settings.setup] - overriding default setup
     * @param {Object} [settings.cancellation] - cancellation callback that allow to get cancellation source
     * Short hand syntax
     * @param {Object} parameters - command parameters
     * @param {*} [data] - command data
     */
    return function (...args /*settings|(parameters[, data[, cancellation]])*/) {
        const config = Object.assign({version: version, command: name}, configuration);

        if (config.notImplemented) {
            throw new Error(
                error.prepare('command ' + config.name + ' is currently not implemented.'),
            );
        }

        if (config.deprecated) {
            throw new Error(
                error.prepare(
                    'command ' + config.name + ' is deprecated for api version ' + version + ' .',
                ),
            );
        }

        let localSetup, parameters, data, cancellation;

        if (
            typeof args[0] === 'object' &&
            Object.prototype.hasOwnProperty.call(args[0], 'parameters')
        ) {
            localSetup = args[0].setup || {};
            parameters = args[0].parameters;
            data = args[0].data;
            cancellation = args[0].cancellation;

            if (typeof parameters !== 'object') {
                throw new Error(
                    error.prepare('bad command arguments - parameters must be an object.'),
                );
            }
        } else if (typeof args[0] === 'object') {
            parameters = args[0];

            if (typeof args[1] === 'function') {
                cancellation = args[1];
            } else {
                data = args[1];
                cancellation = args[2];
            }
        } else {
            throw new Error(error.prepare('bad command arguments - parameters must be an object.'));
        }

        return core._request(localSetup, {
            config: config,
            parameters: parameters,
            data: data,
            cancellation: cancellation,
        });
    };
};

core._initApiVersion = function (yt, version) {
    const currentVersion = (yt[version] = {});
    const apiVersion = commands[version];

    Object.keys(apiVersion).reduce(function (inited, commandName) {
        inited[commandName] = core._initCommand(version, apiVersion[commandName], commandName);

        return inited;
    }, currentVersion);
};

module.exports = core;
