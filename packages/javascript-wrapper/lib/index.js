const commands = require('./commands');

function getSupportedCommands() {
    return Object.keys(commands).reduce((acc, version) => {
        acc[version] = Object.keys(commands[version]).reduce((cmdAcc, command) => {
            const item = commands[version][command];
            const {name, heavy} = item;
            cmdAcc.set(name, {heavy});
            return cmdAcc;
        }, new Map());
        return acc;
    }, {});
}

module.exports = function (settings) {
    'use strict';

    const core = require('./core');

    const yt = {
        setup: require('./utils/setup.js'),
        codes: require('./commands/codes.js'),
        core: core,
        getSupportedCommands,
    };

    core._makeSubscribable(yt);

    core._initApiVersion(yt, 'v2');
    core._initApiVersion(yt, 'v3');
    core._initApiVersion(yt, 'v4');

    settings = settings || {};

    if (settings.exportBrowserModule && typeof window !== 'undefined') {
        // MODULES FOR BROWSERS
        let define;
        const requirejsSupported = typeof window.define === 'function' && window.define.amd;
        const ymodulesSupported = typeof window.modules === 'object';

        const provide = function (value) {
            return value;
        };

        const unify = function (code) {
            if (ymodulesSupported) {
                return code;
            } /* else if (requirejsSupported) or global */ else {
                return code.bind(null, provide);
            }
        };

        if (requirejsSupported) {
            define = window.define;
        } else if (ymodulesSupported) {
            define = window.modules.define.bind(window.modules);
        } else {
            define = function (global, callback) {
                window[global] = callback();
            };
        }

        // For correct optimization RequereJS requires dependencies to be arrays of string literals,
        // also using named modules for compatibility
        // See docs http://requirejs.org/docs/optimization.html
        define(
            'yt',
            unify(function (provide) {
                'use strict';

                return provide(yt);
            }),
        );
    }

    return yt;
};
