'use strict';

var error = require('./error.js');

var _options = {};
var _globalSetup = {};

var setup = {};

setup.createOption = function (name, type, defaultValue) {
    _options[name] = {
        type: type,
        defaultValue: defaultValue
    };
};

setup.setGlobalOption = function (name, value) {
    var option = _options[name];

    if (typeof option === 'undefined') {
        throw new Error(error.prepare('unknown option "' + name + '"'));
    }

    if (typeof value !== option.type) {
        throw new Error(error.prepare('"' + name + '" setup failed - expected type ' + option.type + '.'));
    }

    _globalSetup[name] = value;
};

setup.getLocalOption = function (localSetup, name) {
    var option = _options[name];

    if (typeof option === 'undefined') {
        throw new Error(error.prepare('unknown option "' + name + '"'));
    }

    if (localSetup && typeof localSetup[name] === option.type ) {
        return option.type === 'object' ?
            Object.assign({}, option.defaultValue, localSetup[name]) :
            localSetup[name];
    }
};

setup.getGlobalOption = function (name) {
    var option = _options[name];

    if (typeof option === 'undefined') {
        throw new Error(error.prepare('unknown option "' + name + '"'));
    }

    if (typeof _globalSetup[name] === option.type ) {
        return option.type === 'object' ?
            Object.assign({}, option.defaultValue, _globalSetup[name]) :
            _globalSetup[name];
    }
};

setup.getDefaultOption = function (name) {
    var option = _options[name];

    if (typeof option === 'undefined') {
        throw new Error(error.prepare('unknown option "' + name + '"'));
    }

    return option.defaultValue;
};

setup.getOption = function (localSetup, name) {
    var option = _options[name];

    if (typeof option === 'undefined') {
        throw new Error(error.prepare('unknown option "' + name + '"'));
    }

    if (localSetup && typeof localSetup[name] === option.type ) {
        return option.type === 'object' ?
            Object.assign({}, option.defaultValue, localSetup[name]) :
            localSetup[name];
    }

    if (typeof _globalSetup[name] === option.type ) {
        return option.type === 'object' ?
            Object.assign({}, option.defaultValue, _globalSetup[name]) :
            _globalSetup[name];
    }

    return option.defaultValue;
};

setup.unsetGlobalOption = function (name) {
    var option = _options[name];

    if (typeof option === 'undefined') {
        throw new Error(error.prepare('unknown option "' + name + '"'));
    }

    delete _globalSetup[name];
};

setup.createOption('xsrf', 'boolean', false);
setup.createOption('xsrfCookieName', 'string', 'XSRF-TOKEN');

setup.createOption('secure', 'boolean', true);

setup.createOption('useHeavyProxy', 'boolean', true);

setup.createOption('onUploadProgress', 'function');

setup.createOption('proxy', 'string');

setup.createOption('heavyProxy', 'string');

setup.createOption('remoteLocalProxy', 'string');

setup.createOption('timeout', 'number', 100000);

setup.createOption('useEncodedParameters', 'boolean', true);

setup.createOption('transformResponse', 'function');

setup.createOption('transformError', 'function');

setup.createOption('JSONSerializer', 'object', JSON);

/**
 * Allows to send some custom headers.
 * Names of custom headers should be chosen carefully cause values of the library specific headers will be overridden.
 */
setup.createOption('requestHeaders', 'object', {});

setup.createOption('suppressAccessTracking', 'boolean', false);

var btoa = function (string) {
    return Buffer(string).toString('base64');
};

if (typeof window !== 'undefined') {
    btoa = window.btoa;
}

setup.encodeForYt = function (str) {
    return unescape(encodeURIComponent(str));
};

setup.createOption('encodeForYt', 'function', setup.encodeForYt);

setup.createOption('encodedParametersSettings', 'object', {
    maxSize: 64 * 1024,
    maxCount: 2,
    encoder: function (string) {
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
        return btoa(setup.encodeForYt(string));
    },
});

setup.createOption('authentication', 'object', {
    type: 'none'
});

setup.createOption('dataType', 'string', '');

// TODO additional validation
// if (authentication.type !== 'oauth' && authentication.type !== 'domain' && authentication.type !== 'none') {
//     throw new Error(yt.utils._error.prepare('"authentication" setup failed - authentication.type is required and must be either "oauth", "domain" or "none".'));
// }
//
// if (authentication.type === 'oauth' && typeof authentication.token === 'undefined') {
//     throw new Error(yt.utils._error.prepare('"authentication" setup failed - authentication.token must is required and be a string.'));
// }

module.exports = setup;
