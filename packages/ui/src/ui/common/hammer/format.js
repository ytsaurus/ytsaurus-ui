import hammer from '@ytsaurus/interface-helpers/lib/hammer';

import moment from 'moment';

import forEach_ from 'lodash/forEach';

const format = hammer.format;

function parseSetting(...args) {
    return hammer.utils.parseSetting(...args);
}

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

    forEach_(replacements, (replacementSettings) => {
        value = value.replace.apply(value, replacementSettings);
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

    forEach_(replacements, (replacementSettings) => {
        const regex = new RegExp('(^|\\s)(' + replacementSettings[0] + ')($|\\s)', 'i');
        const replacement = '$1' + replacementSettings[1] + '$3';
        value = value.replace(regex, replacement);
    });

    return value;
}

/**
 * Formats API fields. E.g uncompressed_data_size -> Uncompressed size, partition_count -> Partitions
 * @param {String} value
 * @param {Object} settings
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

// copied from @ytsaurus/interface-helpers
/**
 * Show a readable time duration string
 * @param {Number} value - number of milliseconds
 * @param {Object} settings
 * @param {String} settings.format - 'milliseconds' or omitted
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
        durationHash = moment.duration(value);

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
        formatted = preformat(formatted).replace(/_/g, hammer.format.HYPHEN);
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

export default format;
