import type {languages} from 'monaco-editor';
import {
    constants,
    dataTypeFamiliesCaseInsensitive,
    dataTypeFamiliesCaseSensitive,
    functionsCaseInsensitive,
    functionsCaseSensitive,
    keywords,
    // keywordsDouble,
    tableEngines,
    tableFunctions,
} from './clickhouse.keywords';

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '--',
        blockComment: ['```', '```'],
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
};

const keywordsCaseInsensitive = getCaseInsensitiveRegExp(keywords);
const typeKeywordsCaseInsensitive = getCaseInsensitiveRegExp(
    oneWordPatterns(dataTypeFamiliesCaseInsensitive),
);
const builtinFunctionsCaseInsensitive = getCaseInsensitiveRegExp(functionsCaseInsensitive);

export const language: languages.IMonarchLanguage & Record<string, unknown> = {
    defaultToken: 'text',

    brackets: [
        {open: '[', close: ']', token: 'delimiter.square'},
        {open: '(', close: ')', token: 'delimiter.parenthesis'},
        {open: '{', close: '}', token: 'delimiter.curly'},
    ],

    keywords,

    keywordsDouble: [
        `${caseInsensitiveRegExp('GROUP')}\\W+${caseInsensitiveRegExp('BY')}`,
        `${caseInsensitiveRegExp('ON')}\\W+${caseInsensitiveRegExp('CLUSTER')}`,
        `${caseInsensitiveRegExp('ORDER')}\\W+${caseInsensitiveRegExp('BY')}`,
        `${caseInsensitiveRegExp('LIMIT')}\\W+\\d+\\W*,\\W*\\d+`,
        `${caseInsensitiveRegExp('LIMIT')}\\W+\\d+\\W+${caseInsensitiveRegExp('BY')}\\W+`,
        `${caseInsensitiveRegExp('LIMIT')}\\W+\\d+`,
        `${caseInsensitiveRegExp('RENAME')}\\W+${caseInsensitiveRegExp('TABLE')}`,
        `${caseInsensitiveRegExp('IF')}\\W+${caseInsensitiveRegExp(
            'NOT',
        )}\\W+${caseInsensitiveRegExp('EXISTS')}`,
        `${caseInsensitiveRegExp('IF')}\\W+${caseInsensitiveRegExp('EXISTS')}`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+Vertical`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+JSONCompact`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+JSONEachRow`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+TSKV`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+TabSeparatedWithNames`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+TabSeparatedWithNamesAndTypes`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+TabSeparatedRaw`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+BlockTabSeparated`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+CSVWithNames`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+CSV`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+JSON`,
        `${caseInsensitiveRegExp('FORMAT')}\\W+TabSeparated`,
    ].join('|'),

    typeKeywords: dataTypeFamiliesCaseSensitive,
    typeKeywordsDouble: getCaseInsensitiveRegExp(
        manyWordsPatterns(dataTypeFamiliesCaseInsensitive),
    ),
    constants,

    builtinFunctions: functionsCaseSensitive,

    tableFunctions,
    tableEngines,

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
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    // TODO: FIX ME
    variables: /[\w]+(?:\[[\w\]+]|[=-]>\w+)?/,

    tokenizer: {
        root: [
            {include: '@whitespace'},
            {include: '@comments'},
            {include: '@numbers'},
            {include: '@strings'},
            // variables
            [/[$@:](@variables)/, 'variable'],
            [/{(@variables)}/, 'variable'],
            [/[?;,.]/, 'delimiter'],
            [/[(){}[\]]/, '@brackets'],
            [/(\w+\.)*`\/\/(.*)`/g, {token: 'path'}],
            // identifiers and keywords
            [/@keywordsDouble/, 'keyword'],
            [/@typeKeywordsDouble/, 'keyword.type'],
            [
                /[a-zA-Z_$][\w$]*/,
                {
                    cases: {
                        [keywordsCaseInsensitive]: {token: 'keyword'},
                        '@constants': {token: 'constant'},
                        '@builtinFunctions': {token: 'constant.other.color'},
                        [builtinFunctionsCaseInsensitive]: {token: 'constant.other.color'},
                        '@tableFunctions': {token: 'constant.other.color'},
                        '@tableEngines': {token: 'constant.other.color'},
                        '@typeKeywords': {token: 'keyword.type'},
                        [typeKeywordsCaseInsensitive]: {token: 'keyword.type'},
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
            [/--+.*/, 'comment'],
            [/\/\*/, {token: 'comment.quote', next: '@cppComment'}],
        ],
        comment: [
            [/[^`]+/, 'comment'],
            [/./, 'comment'],
        ],
        cppComment: [
            [/[^*/]+/, 'comment'],
            [/./, 'comment'],
        ],
        numbers: [[/[+-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/, 'number']],
        strings: [
            [/'/, {token: 'string', next: '@stringSingle'}],
            [/"/, {token: 'string.tablepath', next: '@stringDouble'}],
        ],
        stringSingle: [
            [/[^\\']/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'/, {token: 'string', next: '@pop'}],
        ],
        stringDouble: [
            [/[^\\"]/, 'string.tablepath'],
            [/@escapes/, 'string.tablepath'],
            [/\\./, 'string.tablepath'],
            [/"/, {token: 'string.tablepath', next: '@pop'}],
        ],
    },
};

function caseInsensitiveRegExp(pattern: string) {
    return pattern
        .split('')
        .map((char) => {
            if (/[a-zA-Z]/.test(char)) {
                return `[${char.toLowerCase()}${char.toUpperCase()}]`;
            }
            return char;
        })
        .join('');
}

function getCaseInsensitiveRegExp(patterns: string[]) {
    return `(${patterns
        .map((pattern) => caseInsensitiveRegExp(pattern).replace(/\s+/g, '\\s'))
        .join('|')})`;
}

function oneWordPatterns(patterns: string[]) {
    return patterns.filter((pattern) => /^\S*$/.test(pattern));
}

function manyWordsPatterns(patterns: string[]) {
    return patterns.filter((pattern) => /\s/.test(pattern)).sort((a, b) => b.localeCompare(a));
}
