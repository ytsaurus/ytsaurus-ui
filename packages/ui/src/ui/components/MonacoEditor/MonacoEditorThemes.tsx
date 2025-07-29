import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const lightRules = [
    {token: 'tablepath', foreground: '3e999f'},
    {token: 'path', foreground: '3e999f', fontStyle: 'underline'},
    {token: 'string.sql', foreground: 'a31515'},
];

export const YT_LIGHT_MONACO_THEME = 'yt-light';
monaco.editor.defineTheme(YT_LIGHT_MONACO_THEME, {
    base: 'vs', // can also be vs-dark or hc-black
    inherit: true, // can also be false to completely replace the builtin rules
    rules: lightRules,
    colors: {
        'editorLineNumber.foreground': '#000000b3',
        'editor.lineHighlightBackground': '#0000000a',
        'editorGutter.background': '#0000000a',
    },
});

export const YT_LIGHT_HC_MONACO_THEME = 'yt-light-hc';
monaco.editor.defineTheme(YT_LIGHT_HC_MONACO_THEME, {
    base: 'hc-light',
    inherit: true,
    rules: lightRules,
    colors: {},
});

const darkRules = [
    {token: 'tablepath', foreground: '3e999f'},
    {token: 'path', foreground: '3e999f', fontStyle: 'underline'},
    {token: 'string.sql', foreground: 'ce9178'},
];

export const YT_DARK_MONACO_THEME = 'yt-dark';
monaco.editor.defineTheme(YT_DARK_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: darkRules,
    colors: {
        'editorLineNumber.foreground': '#ffffffb3',
        'editor.lineHighlightBackground': '#ffffff0a',
        'editorGutter.background': '#ffffff0a',
        'editor.background': '#2d2c33',
    },
});

export const YT_DARK_HC_MONACO_THEME = 'yt-dark-hc';
monaco.editor.defineTheme(YT_DARK_HC_MONACO_THEME, {
    base: 'hc-black',
    inherit: true,
    rules: darkRules,
    colors: {},
});
