import {Position, editor, languages} from 'monaco-editor';
import {getRangeToInsertSuggestion} from '../helpers/getRangeToInsertSuggestion';
import {generateSuggestion} from '../helpers/generateSuggestions';
import {builtinFunctions, keywords, typeKeywords} from '../yql/yql.keywords';
import {keywords as suggestKeywords} from './yql_ansi.keywords';
import {getDirectoryContent} from '../helpers/getDirectoryContent';
import {QueryEngine} from '../../../../shared/constants/engines';

export {conf} from '../yql/yql';

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
            [/(\w+\.)*`\/\/(.*)`/g, {token: 'path'}],
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
            [/\/\*/, {token: 'comment.quote', next: '@commentAnsi'}],
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
            [/'/, {token: 'string', next: '@stringAnsiSingle'}],
            [/"/, {token: 'string', next: '@stringAnsiDouble'}],
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

export const provideSuggestionsFunction = async (
    model: editor.ITextModel,
    monacoCursorPosition: Position,
): Promise<{suggestions: languages.CompletionItem[]}> => {
    const range = getRangeToInsertSuggestion(model, monacoCursorPosition);
    const pathSuggestions = await getDirectoryContent({
        model,
        monacoCursorPosition,
        engine: QueryEngine.YT_QL,
        range,
    });

    return {
        suggestions: [
            ...pathSuggestions,
            ...generateSuggestion({
                kind: languages.CompletionItemKind.Keyword,
                detail: 'Keyword',
                suggestionType: 'suggestKeywords',
                rangeToInsertSuggestion: range,
                items: [...suggestKeywords],
            }),
        ],
    };
};
