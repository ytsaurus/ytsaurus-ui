const BigNumber = require('bignumber.js');
const _map = require('lodash/map');
const forEach = require('lodash/forEach');
const {dateTime, duration} = require('@gravity-ui/date-utils');

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
        return dateTime({input: value * 1000});
    }
    if (format.validString(value)) {
        return dateTime({input: value});
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

format['NumberWithSuffix'] = function (value, settings) {
    const digits = parseSetting(settings, 'digits', 2);
    const NAMES = ['', ' K', ' M', ' G', ' T', ' P', ' E'];

    return formatWithSuffixes({value, digits, NAMES, DIVIDER: 1000});
};

format['Bytes'] = function (value, settings) {
    const digits = parseSetting(settings, 'digits', 2);
    const NAMES = [' B', ' KiB', ' MiB', ' GiB', ' TiB', ' PiB', ' EiB'];

    return formatWithSuffixes({value, digits, NAMES, DIVIDER: 1024});
};

function formatWithSuffixes({value, digits, NAMES, DIVIDER}) {
    const firstSuffix = NAMES[0];
    let len;
    let i;

    if (format.validNumber(value)) {
        const isNegative = value < 0;
        value = isNegative ? Math.abs(value) : value;

        // Divide bytes by 1024 until remainder is smaller than 1024 or list of names has ended
        for (i = 0, len = NAMES.length; i < len - 1 && value >= DIVIDER; i++, value /= DIVIDER) {
            continue;
        }

        digits = i === 0 ? 0 : digits;

        if (value === 0) {
            return value.toFixed(digits) + firstSuffix;
        }

        const sign = isNegative ? '-' : '';
        return sign + value.toFixed(digits) + NAMES[i];
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
                i < len - 1 && value.gte(DIVIDER);
                i++, value = value.dividedBy(DIVIDER)
            ) {
                continue;
            }

            digits = i === 0 ? 0 : digits;

            if (value === 0) {
                return value.toFixed(digits) + firstSuffix;
            }

            const sign = isNegative ? '-' : '';

            return sign + value.toFixed(digits) + NAMES[i];
        } catch (ex) {
            return format.NO_VALUE;
        }
    } else {
        return format.NO_VALUE;
    }
}

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
 * @param {Object} [settings]
 * @param {String} [settings.format] 'port' or omitted
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
 * @param {Object} [settings]
 * @param {String} [settings.delimiter] - any string, by default '_'
 * @param {String} [settings.caps] - 'all', 'none', by default 'first'
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

function preformat(value) {
    const replacements = [
        ['dynamic_row_read_rate', 'dynamic_read'],
        ['dynamic_row_lookup_rate', 'dynamic_lookup'],
        ['dynamic_row_delete_rate', 'dynamic_delete'],
        ['dynamic_row_write_rate', 'dynamic_write'],
        ['static_chunk_row_read_rate', 'static_chunk_read'],
        ['static_chunk_row_lookup_rate', 'static_chunk_lookup'],
        ['unmerged_row_read_rate', 'unmerged_read'],
        ['merged_row_read_rate', 'merged_read'],
        [/_count$/, 's'],
        [/_data_size$/, '_size'],
    ];

    forEach(replacements, (replacementSettings) => {
        value = value.replace(...replacementSettings);
    });

    return value;
}

function postformat(value) {
    const replacements = [
        ['acl', 'ACL'],
        ['id', 'Id'],
        ['cpu', 'CPU'],
        ['ram', 'RAM'],
        ['gpu', 'GPU'],
        ['In memory', 'In-memory'],
        ['Yt', 'YT'],
        ['Yamr', 'YaMR'],
        ['Io', 'IO'],
        ['Ssd', 'SSD'],
        ['hdd', 'HDD'],
        ['Rpc', 'RPC'],
        ['VCPU', 'vCPU'],
        ['vcpu', 'vCPU'],
        ['tablet-cell-bundle', 'TABLET CELL BUNDLE'],
        ['Fifo', 'FIFO'],
        ['Http', 'HTTP'],
        ['lastVisited', 'Visited'],
    ];

    forEach(replacements, (replacementSettings) => {
        const regex = new RegExp('(^|\\s)(' + replacementSettings[0] + ')($|\\s)', 'i');
        const replacement = '$1' + replacementSettings[1] + '$3';
        value = value.replace(regex, replacement);
    });

    return value;
}

/**
 * Formats API fields. E.g uncompressed_data_size -> Uncompressed size, partition_count -> Partitions
 * @param {String} value
 * @param {Object} [settings]
 * @returns {String}
 */
format['ReadableField'] = function (value, settings) {
    settings = settings || {};

    let formatted = value;

    if (formatted) {
        formatted = preformat(formatted);
        formatted = format['Readable'](formatted, {
            delimiter: '_',
            caps: parseSetting(settings, 'caps', 'first'),
        });
        formatted = postformat(formatted);
    }

    return formatted;
};

/**
 * @param {*} v
 * @param {Object} [settings]
 * @param {String} [settings.format]
 * @param {String} [settings.pattern]
 */
format['DateTime'] = function (v, settings) {
    const dateFormat = parseSetting(settings, 'format', 'full');
    const datePattern = parseSetting(settings, 'pattern');

    if (v === undefined || v === null) {
        return format.NO_VALUE;
    }

    const value = format.toMoment(v);

    if (datePattern) {
        return value.format(datePattern);
    }

    switch (dateFormat) {
        case 'human':
            return value.fromNow();
        case 'full':
            return value.format('DD MMM YYYY HH:mm:ss');
        case 'short':
            return value.format('DD MMM HH:mm');
        case 'day':
            return value.format('DD MMM YYYY');
        case 'month':
            return value.format('MMMM YYYY');
        case 'time':
            return value.format('HH:mm:ss');
        default:
            throw new Error(
                'hammer.format.DateTime: Unknown `format` option. Please specify one of [human, full, short, day, month] or use `pattern` option.',
            );
    }
};

/**
 * Show a readable time duration string
 * @param {Number} value - number of milliseconds
 * @param {Object} [settings]
 * @param {String} [settings.format] - 'milliseconds' or omitted
 */
format['TimeDuration'] = function (value, settings) {
    const TIME_MEASURES = [
        'years',
        'months',
        'days',
        'hours',
        'minutes',
        'seconds',
        'milliseconds',
    ];
    const OUTPUT_FORMATTER = {
        years: 'y ',
        months: 'm ',
        days: 'd ',
        hours: ':',
        minutes: ':',
        seconds: '',
        milliseconds: '.',
    };
    let durationOutput;
    let durationHash;

    const showMilliseconds = parseSetting(settings, 'format') === 'milliseconds';

    if (format.validNumber(value)) {
        durationOutput = '';
        durationHash = duration(value);

        TIME_MEASURES.forEach(function (measure) {
            const measureValue = durationHash[measure]();

            if (measure === 'years' || measure === 'months' || measure === 'days') {
                if (measureValue > 0) {
                    durationOutput += measureValue + OUTPUT_FORMATTER[measure];
                }
            } else if (measure === 'hours' || measure === 'minutes' || measure === 'seconds') {
                durationOutput += format['StrPad'](measureValue, '0') + OUTPUT_FORMATTER[measure];
            } else if (measure === 'milliseconds' && showMilliseconds) {
                durationOutput +=
                    OUTPUT_FORMATTER[measure] + format['StrPad'](measureValue, '0', 3);
            }
        });

        return durationOutput;
    } else {
        return format.NO_VALUE;
    }
};

format['UnderscoreToHyphen'] = format['CssTemplateField'] = function (value) {
    let formatted = value;
    if (formatted) {
        formatted = preformat(formatted).replace(/_/g, format.HYPHEN);
    }
    return formatted;
};

/**
 * Parses words and number in rack name and returns a vector that can be used for sorting
 * @param value {String}
 * @returns {Array}
 * @constructor
 */
format['RackToVector'] = function (value) {
    const rackPartRegex = /([a-z]+)|(\d+)|([-.])/i;
    const vector = [];
    let currentMatch;

    if (typeof value !== 'undefined') {
        do {
            currentMatch = rackPartRegex.exec(value);

            if (currentMatch !== null) {
                if (currentMatch[2]) {
                    vector.push(parseInt(currentMatch[2], 10));
                } else if (currentMatch[1]) {
                    vector.push(currentMatch[1].toLowerCase());
                } else {
                    vector.push(currentMatch[3]);
                }

                value = value.substring(currentMatch.index + currentMatch[0].length);
            }
        } while (currentMatch !== null);
    } else {
        vector.push(value);
    }

    return vector;
};

format['vCores'] = function (value) {
    const tmp = Number.isNaN(value) ? undefined : Math.floor(value / 1000);
    return `${format.Number(tmp)} cores`;
};

format['RowsPerSecond'] = function (value, settings = {digits: 2}) {
    if (!value) {
        return format.Number(value, settings);
    }
    return `${format.Number(value, settings)} rows/s`;
};

format['NumberSmart'] = function NumberSmart(value, settings) {
    let significantDigits = parseSetting(settings, 'significantDigits', 3);
    const MAX_PRECISION = 20;
    const DECIMAL_DELIMETER = '.';
    const ZERO = '0';

    if (format.validNumber(value)) {
        if (value === 0) {
            return '0';
        }

        const [integerPart, decimalPart] = value.toFixed(MAX_PRECISION).split(DECIMAL_DELIMETER);
        let siginificantDigitEncountered = false;

        if (integerPart !== ZERO && integerPart !== `-${ZERO}`) {
            if (integerPart.length >= significantDigits) {
                return format.Number(value, {digits: 0});
            }

            siginificantDigitEncountered = true;
            significantDigits -= value > 0 ? integerPart.length : integerPart.length - 1;
        }

        let decimalResult = '';
        let hasSignificantDecimalPart = false;

        for (let i = 0; i < decimalPart.length && significantDigits > 0; i++) {
            const digit = decimalPart[i];

            if (digit !== ZERO) {
                siginificantDigitEncountered = true;
                hasSignificantDecimalPart = true;
            }

            if (siginificantDigitEncountered) {
                significantDigits--;
            }

            decimalResult += digit;
        }

        if (!hasSignificantDecimalPart) {
            return format.Number(value, {digits: 0});
        }

        const res = format.Number(value, {digits: decimalResult.length});
        const dotIndex = -1 !== res.indexOf(DECIMAL_DELIMETER);
        if (dotIndex === -1) {
            return res;
        }

        for (let i = res.length - 1; i >= 0; --i) {
            if (res[i] !== ZERO) {
                return res.substring(0, i + 1);
            }
        }

        return res;
    } else {
        return format.NO_VALUE;
    }
};

module.exports = format;
