import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const YT_LIGHT_MONACO_THEME = 'yt-light';
monaco.editor.defineTheme(YT_LIGHT_MONACO_THEME, {
    base: 'vs', // can also be vs-dark or hc-black
    inherit: true, // can also be false to completely replace the builtin rules
    rules: [
        {token: 'tablepath', foreground: '3e999f'},
        {token: 'string.sql', foreground: 'a31515'},
    ],
    colors: {
        'editorLineNumber.foreground': '#000000b3',
        'editor.lineHighlightBackground': '#0000000a',
        'editorGutter.background': '#0000000a',
    },
});

export const YT_DARK_MONACO_THEME = 'yt-dark';
monaco.editor.defineTheme(YT_DARK_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
        {token: 'tablepath', foreground: '3e999f'},
        {token: 'string.sql', foreground: 'ce9178'},
    ],
    colors: {
        'editorLineNumber.foreground': '#ffffffb3',
        'editor.lineHighlightBackground': '#ffffff0a',
        'editorGutter.background': '#ffffff0a',
        'editor.background': '#2d2c33',
    },
});
