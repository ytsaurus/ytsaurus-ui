const BigNumber = require('bignumber.js');
const _map = require('lodash/map');
const moment = require('moment');

const type = require('./type');
const utils = require('./utils');

const format = {};
const parseSetting = utils.parseSetting;

BigNumber.config({
    FORMAT: {
        decimalSeparator: '.',
        groupSeparator: ' ',
        groupSize: 3,
        secondaryGroupSize: 3,
    },
});

format.NO_VALUE = '–'; // en-dash
format.HYPHEN = '-';

format.validString = function (value) {
    return type.isString(value);
};

format.validNumber = function (value) {
    return type.isNumber(value);
};

format.toMoment = function (value) {
    if (format.validNumber(value)) {
        // Assume unix timestamp
        return moment.unix(value);
    } else if (format.validString(value)) {
        return moment(value);
    }
};

format['Number'] = function (value, settings) {
    /*WARNING due to the use of toFixed value is rounded if neccecary*/
    const digits = parseSetting(settings, 'digits', 0);
    const delimiter = parseSetting(settings, 'delimiter', ' ');
    const digitsOnlyForFloat = parseSetting(settings, 'digitsOnlyForFloat', false);

    if (format.validNumber(value)) {
        const x = value.toFixed(digits).split('.');
        let x1 = x[0];
        let x2 = '';
        if (x.length > 1 && (!digitsOnlyForFloat || !/^0+$/.test(x[1]))) {
            x2 = '.' + x[1];
        }
        const rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + delimiter + '$2');
        }
        return x1 + x2;
    } else if (format.validString(value)) {
        try {
            const v = new BigNumber(value);
            if (v.isNaN()) {
                return format.NO_VALUE;
            }
            return v.toFormat(digits, {
                groupSeparator: delimiter,
                decimalSeparator: '.',
                groupSize: 3,
                secondaryGroupSize: 3,
            });
        } catch (ex) {
            return format.NO_VALUE;
        }
    } else {
        return format.NO_VALUE;
    }
};

format['SmallNumber'] = function (value, settings) {
    let significantDigits = parseSetting(settings, 'significantDigits', 0);
    const MAX_PRECISION = 20;
    const DECIMAL_DELIMETER = '.';
    const INSIGNIFICANT_DIGIT = 0;

    if (format.validNumber(value)) {
        if (value === 0) {
            return '0';
        }

        const stringified = value.toFixed(MAX_PRECISION).split(DECIMAL_DELIMETER);
        const integerPart = stringified[0];
        const decimalPart = stringified[1].split('');

        let result = format['Number'](Number(integerPart));
        let siginificantDigitEncountered = false;

        for (let i = 0; i < decimalPart.length && significantDigits; i++) {
            const digit = decimalPart[i];

            if (Number(digit) !== INSIGNIFICANT_DIGIT) {
                siginificantDigitEncountered = true;
            }

            if (siginificantDigitEncountered) {
                significantDigits--;
            }

            if (i === 0) {
                result += DECIMAL_DELIMETER;
            }

            result += digit;
        }

        return result;
    } else {
        return format.NO_VALUE;
    }
};

format['NumberPerSecond'] = function (value, settings) {
    settings = settings || {};

    if (format.validNumber(value)) {
        return format['Number'](value, settings) + ' ' + settings.measure + '/s';
    } else {
        return format.NO_VALUE;
    }
};

format['Bytes'] = function (value, settings) {
    let digits = parseSetting(settings, 'digits', 2);
    const defaultPostfix = parseSetting(settings, 'defaultPostfix', 'B');
    const NAMES = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
    let len;
    let i;

    if (format.validNumber(value)) {
        const isNegative = value < 0;
        value = isNegative ? Math.abs(value) : value;

        // Divide bytes by 1024 until remainder is smaller than 1024 or list of names has ended
        for (i = 0, len = NAMES.length; i < len - 1 && value >= 1024; i++, value /= 1024) {
            continue;
        }

        digits = i === 0 ? 0 : digits;

        if (value === 0) {
            return value.toFixed(digits) + ' ' + defaultPostfix;
        }

        const sign = isNegative ? '-' : '';
        return sign + value.toFixed(digits) + ' ' + NAMES[i];
    } else if (format.validString(value)) {
        try {
            value = new BigNumber(value);
            if (value.isNaN()) {
                return format.NO_VALUE;
            }
            const isNegative = value.isNegative();
            value = value.abs();

            // Divide bytes by 1024 until remainder is smaller than 1024 or list of names has ended
            for (
                i = 0, len = NAMES.length;
                i < len - 1 && value.gte(1024);
                i++, value = value.dividedBy(1024)
            ) {
                continue;
            }

            digits = i === 0 ? 0 : digits;

            if (value === 0) {
                return value.toFixed(digits) + ' ' + defaultPostfix;
            }

            const sign = isNegative ? '-' : '';

            return sign + value.toFixed(digits) + ' ' + NAMES[i];
        } catch (ex) {
            return format.NO_VALUE;
        }
    } else {
        return format.NO_VALUE;
    }
};

format['BytesPerSecond'] = function (value, settings) {
    if (format.validNumber(value)) {
        return format['Bytes'](value, settings) + '/s';
    } else {
        return format.NO_VALUE;
    }
};

format['Uppercase'] = function (value) {
    return value && value.toUpperCase();
};

format['FirstUppercase'] = function (value) {
    return value && value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Adds leading symbols to input
 * @param {String} string input
 * @param {String} padStr leading symbols
 * @param {Number} length output string length
 * @param {Boolean} right add symbols after instead of before
 * @returns {string}
 */
format['StrPad'] = function (string, padStr, length, right) {
    string = String(string);
    length = length || 2;
    if (string.length >= length || !padStr || !padStr.length) {
        return string;
    }
    const tailLength = length - string.length;
    while (padStr.length < tailLength) {
        padStr += padStr;
    }
    padStr = padStr.substr(0, tailLength);
    return right ? string + padStr : padStr + string;
};

format['Percent'] = function (value, settings) {
    const digits = parseSetting(settings, 'digits', 2);
    if (format.validNumber(value)) {
        return value.toFixed(digits) + '%';
    } else {
        return format.NO_VALUE;
    }
};

/**
 * Allows to strip port from fqdn
 * @param {String} value
 * @param {Object} settings
 * @param {String} settings.format 'port' or omitted
 * @returns {*}
 */
format['Address'] = function (value, settings) {
    if (format.validString(value)) {
        const preservePort = parseSetting(settings, 'format') === 'port';

        return preservePort ? value : value && value.split(':')[0];
    } else {
        return format.NO_VALUE;
    }
};

format['ValueOrDefault'] = function (value, settings) {
    if (typeof value !== 'undefined') {
        return value;
    } else {
        return parseSetting(settings, 'defaultValue', format.NO_VALUE);
    }
};

format['toBase26'] = function toBijectiveBase26(n, settings) {
    settings = settings || {};

    let result = '';
    const startCharachter = settings.uppercase ? 'A' : 'a';

    while (parseInt(n, 10) > 0) {
        n--;
        result += String.fromCharCode(startCharachter.charCodeAt(0) + (n % 26));
        n /= 26;
    }

    return result.split('').reverse().join('');
};

format['Hex'] = function (value, settings) {
    settings = settings || {};

    settings.uppercase = parseSetting(settings, 'uppercase', false);

    const numberValue = Number(value);
    const result =
        isNaN(numberValue) || (typeof value !== 'number' && typeof value !== 'bigint' && !value)
            ? format.NO_VALUE
            : numberValue.toString(16);

    if (settings.uppercase) {
        result.toUpperCase();
    }

    return result;
};

/**
 * Show readable values. Value is expected to have format 'foo_bar' and turns into 'Foo bar' or 'Foo Bar'
 * @param {String} value
 * @param {Object} settings
 * @param {String} settings.delimiter - any string, by default '_'
 * @param {String} settings.caps - 'all', 'none', by default 'first'
 * @returns {String}
 */
format['Readable'] = function (value, settings) {
    settings = settings || {};

    const delimiter = parseSetting(settings, 'delimiter', '_');
    const caps = parseSetting(settings, 'caps', 'first');
    let formatted = value;

    if (formatted) {
        formatted = formatted.split(delimiter);

        if (caps === 'all') {
            formatted = _map(formatted, format['FirstUppercase']);
        } else if (caps === 'first') {
            formatted[0] = format['FirstUppercase'](formatted[0]);
        }

        formatted = formatted.join(' ');
    }

    return formatted;
};

// COPY-PASTED FROM https://github.com/xxorax/node-shell-escape
/* jshint ignore:start */
// jscs:disable
// return a shell compatible format
function shellescape(a) {
    const ret = [];

    a.forEach(function (s) {
        if (/[^A-Za-z0-9_/:=-]/.test(s)) {
            s = "'" + s.replace(/'/g, "'\\''") + "'";
            s = s
                .replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
                .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
        }
        ret.push(s);
    });

    return ret.join(' ');
}
// jscs:enable
/* jshint ignore:end */

/**
 * An array command parameters is converted to string.
 * @param {Array} value
 */
/* jshint ignore:start */
format['Command'] = function (value) {
    return shellescape(value);
};
/* jshint ignore:end */

module.exports = format;
