import {languages} from '../fillers/monaco-editor-core';
import {keywordControl, keywordOperator, variables} from './s-expressions.keywords';

export const LANGUAGE_ID = 's-expressions';

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '#',
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
    ],
    surroundingPairs: [
        {open: '{', close: '}'},
        {open: '[', close: ']'},
        {open: '(', close: ')'},
    ],
};

export const language: languages.IMonarchLanguage & Record<string, unknown> = {
    defaultToken: 'text',
    ignoreCase: true,
    tokenPostfix: '.yql',

    brackets: [
        {open: '[', close: ']', token: 'delimiter.square'},
        {open: '(', close: ')', token: 'delimiter.parenthesis'},
        {open: '{', close: '}', token: 'delimiter.curly'},
    ],

    keywordControl,

    keywordOperator,

    variables,

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
        root: [
            {include: '@whitespace'},
            {include: '@comment'},
            [/(#)((?:\w|[\\+-=<>'"&#])+)/, ['delimiter', 'constant']],
            [
                /(?:\b(?:(defun|defmethod|defmacro))\b)(\s+)((?:\w|-|\?)*)/,
                ['type.function', 'text', 'entity.name'],
            ],
            [/(\*)(\S*)(\*)/, ['delimiter', 'variable', 'delimiter']],
            {include: '@strings'},
            [/'[^#\s)(]+/, 'variable.parameter'],
            [/[(){}[\]]/, '@brackets'],
            // identifiers and keywords
            [
                /(?:(?:<=?|>=?|==|!=|[-+*/%])|[a-zA-Z][a-zA-Z0-9!]*)/,
                {
                    cases: {
                        '@keywordControl': {token: 'keyword.operator'},
                        '@keywordOperator': {token: 'keyword.control'},
                        '@variables': {token: 'variable'},
                        '@default': 'identifier',
                    },
                },
            ],
        ],
        whitespace: [[/\s+/, 'white']],
        comment: [[/#.*/, 'comment']],
        strings: [
            [/'?"(?=.)/, {token: 'string', next: '@qqstring'}],
            [/'?[@]{2}/, {token: 'string', next: '@multiline'}],
            [/'?x"(?:[0-9A-Fa-f]{2})*"/, 'string'],
        ],
        qqstring: [
            [/\\(?:[0-3][0-7][0-7]|x[0-9A-Fa-f]{2}|["tnrbfav\\])/, 'string.escape'],
            [/[^"\\]+/, 'string'],
            [/"|$/, {token: 'string', next: '@pop'}],
        ],
        multiline: [
            [/[^@]+/, 'string'],
            [/[@]{2}/, {token: 'string', next: '@pop'}],
            [/./, {token: 'string'}],
        ],
    },
};
