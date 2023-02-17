/* eslint-env commonjs */
/* eslint-disable prefer-rest-params */
const _identity = require('lodash/identity');
const _map = require('lodash/map');
const _reduce = require('lodash/reduce');

const VALUE_KEY = '$value';
const ATTRS_KEY = '$attributes';
const yson = {
    value(node) {
        return node?.[VALUE_KEY] !== undefined ? node[VALUE_KEY] : node;
    },
    attributes(node) {
        return node?.[ATTRS_KEY] !== undefined ? node[ATTRS_KEY] : {};
    },
};

const ypath = {};

const ESCAPE_TOKEN = '\\';
const GET_CHILD_TOKEN = '/';
const GET_CHILD_TOKEN_LEN = GET_CHILD_TOKEN.length;
const GET_ATTRIBUTE_TOKEN = GET_CHILD_TOKEN + '@';
const GET_ATTRIBUTE_TOKEN_LEN = GET_ATTRIBUTE_TOKEN.length;
const SUPPRESS_REDIRECT_TOKEN = '&';
const SUPPRESS_REDIRECT_TOKEN_LEN = SUPPRESS_REDIRECT_TOKEN.length;

// Make sure this object only has given properties
const SPECIAL_SYMBOLS = Object.create(null, {
    '\\': {value: true},
    '/': {value: true},
    '@': {value: true},
    '&': {value: true},
    '*': {value: true},
    '{': {value: true},
    '[': {value: true},
});

const NAVIGATE_CHILD = 0;
const NAVIGATE_ATTRIBUTE = 1;
const SUPPRESS_REDIRECT = 2;

function createErrorClass(name) {
    const CustomError = function () {
        const base = Error.apply(this, arguments);

        this.name = base.name = name;
        this.message = base.message;
        this.stack = base.stack;
    };

    CustomError.prototype = Object.create(Error.prototype);

    return CustomError;
}

const YPathError = createErrorClass('YPathError');

function assertEntity(node) {
    if (node === null) {
        throw new YPathError('entity encountered along given path.');
    }
}

function repeatChar(char, repeatCount) {
    let string = '';
    for (let i = 0; i < repeatCount; i++) {
        string += char;
    }
    return string;
}

function toPaddedHex(charCode, digits) {
    return (repeatChar('0', digits) + charCode.toString(16)).substr(-digits);
}

ypath._next = function (path) {
    let action;

    if (path.indexOf(GET_ATTRIBUTE_TOKEN) === 0) {
        action = NAVIGATE_ATTRIBUTE;
        path = path.substring(GET_ATTRIBUTE_TOKEN_LEN);
    } else if (path.indexOf(GET_CHILD_TOKEN) === 0) {
        action = NAVIGATE_CHILD;
        path = path.substring(GET_CHILD_TOKEN_LEN);
    } else if (path.indexOf(SUPPRESS_REDIRECT_TOKEN) === 0) {
        action = SUPPRESS_REDIRECT;
        path = path.substring(SUPPRESS_REDIRECT_TOKEN_LEN);
    } else {
        throw new YPathError(
            'invalid relative ypath "' + path + '" - fragment should start with action modifier.',
        );
    }

    let name = '';

    // TODO check character range in name

    if (action !== SUPPRESS_REDIRECT) {
        for (let i = 0, len = path.length; i < len; i++) {
            const currentChar = path.charAt(i);

            if (currentChar === ESCAPE_TOKEN) {
                name += currentChar;

                const nextChar = path.charAt((i += 1));

                if (i < len && SPECIAL_SYMBOLS[nextChar]) {
                    name += nextChar;
                } else if (nextChar === 'x') {
                    // TODO check that next two characters are hexademical and end of string is not reached
                    name += nextChar + path.charAt((i += 1)) + path.charAt((i += 1));
                } else {
                    throw new YPathError(
                        'invalid relative ypath - ' +
                            'invalid special token escape: ' +
                            currentChar +
                            nextChar,
                    );
                }
            } else if (SPECIAL_SYMBOLS[currentChar]) {
                return {
                    action: action,
                    name: name,
                    subpath: path.substring(name.length),
                };
            } else {
                name += currentChar;
            }
        }
    }

    // TODO check that name is not empty

    return {
        action: action,
        name: name,
        subpath: path.substring(name.length),
    };
};

/**
 * Navigate via simple relative ypath with root node
 * @param {Object} node
 * @param {String} path
 * @param {Function} [nodeParser] - node parser can do some action to a node and return new node.
 */
ypath.get = function (node, path, nodeParser) {
    if (typeof path !== 'string') {
        throw new YPathError('invalid relative ypath type - expected string');
    }

    let currentAction;

    nodeParser = nodeParser || _identity;
    node = nodeParser(node);

    while (node !== undefined && path !== '') {
        assertEntity(node);

        currentAction = ypath._next(path);

        if (currentAction.action === NAVIGATE_ATTRIBUTE) {
            node = nodeParser(yson.attributes(node));

            assertEntity(node);

            if (node && currentAction.name) {
                node = nodeParser(node[currentAction.name]);
            }
        } else {
            node = nodeParser(yson.value(node));

            assertEntity(node);

            if (node) {
                node = nodeParser(node[currentAction.name]);
            }
        }

        path = currentAction.subpath;
    }

    return node;
};

ypath.getValue = function (node, path) {
    return yson.value(ypath.get(node, path));
};

ypath.getValues = function (node, paths) {
    return _map(paths, function (path) {
        return ypath.getValue(node, path);
    });
};

/**
 * Creates an abstraction for working with simple ypath (e.g. without suffix and prefix)
 * Stringified ypath is called 'path' in this abstraction
 * @param {YPath} [parsedPath] - parsedPath object to be cloned (other arguments are ignored)
 * @param {String} [path] - stringified ypath
 * @param {String} [type] - path can be 'absolute' and 'relative'
 * @constructor
 */
function YPath(/*[parsedPath][path, type]*/) {
    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
        this.type = arguments[1];

        if (this.type === 'relative') {
            this.fragments = YPath.parseRelative(arguments[0]);
        } else {
            this.fragments = YPath.parseAbsolute(arguments[0]);
        }
    } else {
        const original = arguments[0];

        this.type = original.type;
        this.fragments = [].concat(original.fragments);
    }
}

YPath.prototype.getKey = function () {
    let key;

    for (let i = this.fragments.length - 1; i >= 0; i--) {
        const fragment = this.fragments[i];

        if (fragment.action === NAVIGATE_CHILD || fragment.root) {
            key = fragment.name;
            break;
        }
    }

    return key;
};

YPath.prototype.toSubpath = function (index) {
    this.fragments = this.fragments.slice(0, index + 1);

    return this;
};

YPath.prototype.concat = function (path) {
    this.fragments = this.fragments.concat(YPath.parseRelative(path));

    return this;
};

YPath.prototype.stringify = function () {
    return this.fragments.reduce(function (path, item) {
        if (item.root) {
            path += item.name;
        } else if (item.action === NAVIGATE_CHILD) {
            path += GET_CHILD_TOKEN + item.name;
        } else if (item.action === NAVIGATE_ATTRIBUTE) {
            path += GET_ATTRIBUTE_TOKEN + item.name;
        } else if (item.action === SUPPRESS_REDIRECT) {
            path += SUPPRESS_REDIRECT_TOKEN;
        }

        return path;
    }, '');
};

YPath.create = function (path, type) {
    return new YPath(path, type);
};

YPath.clone = function (parsedPath) {
    return new YPath(parsedPath);
};

YPath.isValid = function (path, type) {
    return Boolean(new YPath(path, type));
};

YPath.escapeSpecialCharacters = function (nodeKey) {
    return _reduce(
        nodeKey,
        (acc, c) => {
            if (SPECIAL_SYMBOLS[c]) {
                return acc + '\\' + c;
            }
            return acc + c;
        },
        '',
    );
};

YPath.fragmentToYSON = function (path) {
    // Decode ypath fragment
    let decoded = '';

    for (let i = 0, len = path.length; i < len; i++) {
        const currentChar = path.charAt(i);

        if (currentChar === ESCAPE_TOKEN) {
            const nextChar = path.charAt((i += 1));

            if (i < len && SPECIAL_SYMBOLS[nextChar]) {
                decoded += nextChar;
            } else if (nextChar === 'x') {
                // TODO check that next two characters are hexademical and end of string is not reached
                const hexEscapeSequence = path.charAt((i += 1)) + path.charAt((i += 1));

                decoded += String.fromCharCode(parseInt(hexEscapeSequence, 16));
            } else {
                throw new YPathError(
                    'invalid path fragment - ' +
                        'invalid escape encountered: ' +
                        currentChar +
                        nextChar,
                );
            }
        } else if (SPECIAL_SYMBOLS[currentChar]) {
            throw new YPathError(
                'invalid path fragment - unescaped special token encountered: ' + currentChar,
            );
        } else {
            decoded += currentChar;
        }
    }

    return decoded;
};

YPath.fragmentFromYSON = function (path) {
    // Encode as ypath fragment
    let encoded = '';

    for (let i = 0, len = path.length; i < len; i++) {
        const currentChar = path.charAt(i);
        const currentCharCode = path.charCodeAt(i);

        if (SPECIAL_SYMBOLS[currentChar]) {
            encoded += ESCAPE_TOKEN + currentChar;
        } else if (currentCharCode > 127 || currentCharCode < 32) {
            encoded += ESCAPE_TOKEN + 'x' + toPaddedHex(currentCharCode, 2);
        } else {
            encoded += currentChar;
        }
    }

    return encoded;
};

YPath.parseRelative = function (relativePath) {
    const fragments = [];

    while (relativePath) {
        const nextFragment = ypath._next(relativePath);

        fragments.push({
            action: nextFragment.action,
            name: nextFragment.name,
        });

        relativePath = nextFragment.subpath;
    }

    return fragments;
};

YPath.parseAbsolute = function (absolutePath) {
    // Absolute ypath has the following structure <root-designator><relative-path>
    // Where <root-designator> is either '/' or '#guid' https://www.npmjs.com/package/uuid-validate

    let rootDesignator;
    let rootType;
    let relativePath;

    if (absolutePath.charAt(0) === '/') {
        rootDesignator = absolutePath.charAt(0);
        relativePath = absolutePath.substring(1);
        rootType = 'tree-root';
    } else if (absolutePath.charAt(0) === '#') {
        // Parse node guid
        const nextFragment = ypath._next('/' + absolutePath.substring(1));
        rootDesignator = absolutePath.charAt(0) + nextFragment.name;
        relativePath = nextFragment.subpath;
        rootType = 'object-root';
    } else {
        throw new YPathError('invalid absolute path - could not parse root designator.');
    }

    return [{root: rootType, name: rootDesignator}].concat(YPath.parseRelative(relativePath));
};

ypath.YPath = YPath;

module.exports = ypath;
