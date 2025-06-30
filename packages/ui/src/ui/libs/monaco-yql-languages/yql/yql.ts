import type {languages} from '../fillers/monaco-editor-core';
import {builtinFunctions, keywords, typeKeywords} from './yql.keywords';

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '--',
        blockComment: ['/*', '*/'],
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
    ],
    autoClosingPairs: [
        {open: '{', close: '}'},
        {open: '[', close: ']'},
        {open: '(', close: ')'},
        {open: '"', close: '"'},
        {open: "'", close: "'"},
        {open: '`', close: '`'},
    ],
    surroundingPairs: [
        {open: '{', close: '}'},
        {open: '[', close: ']'},
        {open: '(', close: ')'},
        {open: '"', close: '"'},
        {open: "'", close: "'"},
        {open: '`', close: '`'},
    ],
    wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",./?\s]+)/g,
};

export const language: languages.IMonarchLanguage & Record<string, unknown> = {
    defaultToken: 'text',
    ignoreCase: true,
    brackets: [
        {open: '[', close: ']', token: 'delimiter.square'},
        {open: '(', close: ')', token: 'delimiter.parenthesis'},
        {open: '{', close: '}', token: 'delimiter.curly'},
    ],

    keywords,

    typeKeywords,

    constants: ['true', 'false'],

    builtinFunctions,

    operators: [
        '+',
        '-',
        '/',
        '//',
        '%',
        '<@>',
        '@>',
        '<@',
        '&',
        '^',
        '~',
        '<',
        '>',
        '<=',
        '=>',
        '==',
        '!=',
        '<>',
        '=',
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[abfnrtv\\"'`]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    variables: /[a-zA-Z_]\w*/,

    tokenizer: {
        root: [
            {include: '@whitespace'},
            {include: '@comments'},
            {include: '@numbers'},
            {include: '@tablePath'},
            {include: '@strings'},
            // support function
            [/(@variables)::(@variables)/, 'support.function'],
            [/[;,.]/, 'delimiter'],
            [/[(){}[\]]/, '@brackets'],
            [/(\w+\.)*`\/\/(.*?)`/g, {token: 'path'}],
            // identifiers and keywords
            [
                /@?[a-zA-Z_$]\w*/,
                {
                    cases: {
                        '@keywords': 'keyword',
                        '@typeKeywords': 'keyword.type',
                        '@constants': 'constant.yql',
                        '@builtinFunctions': 'constant.other.color',
                        '[$@][a-zA-Z_]\\w*': 'variable',
                        '@default': 'identifier',
                    },
                },
            ],
            [
                /@symbols/,
                {
                    cases: {
                        '@operators': 'operator.sql',
                        '@default': '',
                    },
                },
            ],
        ],
        whitespace: [[/\s+/, 'white']],
        comments: [
            [/--.*/, 'comment'],
            [/\/\*/, {token: 'comment.quote', next: '@comment'}],
        ],
        comment: [
            [/[^*/]+/, 'comment'],
            [/\*\//, {token: 'comment.quote', next: '@pop'}],
            [/./, 'comment'],
        ],
        commentAnsi: [
            [/\/\*/, {token: 'comment.quote', next: '@comment'}],
            [/[^*/]+/, 'comment'],
            [/\*\//, {token: 'comment.quote', next: '@pop'}],
            [/./, 'comment'],
        ],
        numbers: [
            [/[+-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?f?\b/, 'number.float'],
            [/[+-]?(?:\d+|0b[01]+|0o[0-8]+|0x[\da-f]+)(?:u?[lst]?)?\b/, 'number'],
        ],
        strings: [
            [/'/, {token: 'string', next: '@stringSingle'}],
            [/"/, {token: 'string', next: '@stringDouble'}],
            [/[@]{2}/, {token: 'string', next: '@multilineString'}],
        ],
        stringSingle: [
            [/[^\\']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'[uyj]?/, {token: 'string', next: '@pop'}],
        ],
        stringAnsiSingle: [
            [/[^']+/, 'string'],
            [/''/, 'string'],
            [/'[uyj]?/, {token: 'string', next: '@pop'}],
        ],
        stringDouble: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"[uyj]?/, {token: 'string', next: '@pop'}],
        ],
        stringAnsiDouble: [
            [/[^"]+/, 'string'],
            [/""/, 'string'],
            [/"[uyj]?/, {token: 'string', next: '@pop'}],
        ],
        multilineString: [
            [/#py/, {token: 'string.python', nextEmbedded: 'python', next: '@embedded', goBack: 3}],
            [
                /\/\/js/,
                {token: 'string.js', nextEmbedded: 'javascript', next: '@embedded', goBack: 4},
            ],
            [/[^@]+/, 'string'],
            [/[@]{4}/, 'string'],
            [/[@]{2}[uyj]?/, {token: 'string', next: '@pop'}],
            [/./, 'string'],
        ],
        embedded: [
            [
                /([^@]|^)([@]{4})*[@]{2}([@]([^@]|$)|[^@]|$)/,
                {token: '@rematch', next: '@pop', nextEmbedded: '@pop'},
            ],
        ],
        tablePath: [[/`\/?[\w+]+`/, {token: 'string.tablepath'}]],
    },
};
