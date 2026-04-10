import type {CSSProperties} from 'react';

import type {TextProps} from './Text';

/** Default Storybook args; shared with Playwright visual tests. */
export const textStoryDefaultArgs: Pick<
    TextProps,
    'children' | 'color' | 'bold' | 'noWrap' | 'ellipsis' | 'disabled' | 'capitalize'
> = {
    children: 'YTsaurus UI text',
    color: undefined,
    bold: false,
    noWrap: false,
    ellipsis: false,
    disabled: false,
    capitalize: false,
};

export const textStoryFrameStyle: CSSProperties = {
    minWidth: 280,
    padding: 12,
    border: '1px dashed var(--g-color-line-generic, #ddd)',
    borderRadius: 8,
};

export type TextVisualCase =
    | {kind: 'yt-text'; id: string; props: TextProps; wrapperStyle?: CSSProperties}
    | {kind: 'Secondary'; id: string; children: string; disabled?: boolean}
    | {kind: 'Bold'; id: string; children: string}
    | {kind: 'SecondaryBold'; id: string; children: string}
    | {kind: 'Warning'; id: string; children: string}
    | {kind: 'WarningLight'; id: string; children: string}
    | {kind: 'NoWrap'; id: string; children: string}
    | {kind: 'Escaped'; id: string; text: string};

/** Stable order for visual regression (light + dark each). */
export const textVisualStoryCases: TextVisualCase[] = [
    {kind: 'yt-text', id: 'default', props: {children: 'YTsaurus UI text'}},
    {
        kind: 'yt-text',
        id: 'color-secondary',
        props: {children: 'Secondary tone', color: 'secondary'},
    },
    {kind: 'yt-text', id: 'color-success', props: {children: 'Success', color: 'success'}},
    {kind: 'yt-text', id: 'color-info', props: {children: 'Info', color: 'info'}},
    {kind: 'yt-text', id: 'color-warning', props: {children: 'Warning', color: 'warning'}},
    {
        kind: 'yt-text',
        id: 'color-warning-light',
        props: {children: 'Warning light', color: 'warning-light'},
    },
    {kind: 'yt-text', id: 'color-danger', props: {children: 'Danger', color: 'danger'}},
    {kind: 'yt-text', id: 'bold', props: {children: 'Bold text', bold: true}},
    {kind: 'yt-text', id: 'disabled', props: {children: 'Disabled', disabled: true}},
    {
        kind: 'yt-text',
        id: 'secondary-disabled',
        props: {children: 'Secondary disabled', color: 'secondary', disabled: true},
    },
    {kind: 'yt-text', id: 'capitalize', props: {children: 'capitalized words', capitalize: true}},
    {
        kind: 'yt-text',
        id: 'ellipsis',
        props: {
            children: 'Very long text that should be truncated with ellipsis in a narrow box',
            ellipsis: true,
        },
        wrapperStyle: {maxWidth: 140},
    },
    {
        kind: 'yt-text',
        id: 'no-wrap',
        props: {children: 'Single line: noWrap keeps this on one line', noWrap: true},
        wrapperStyle: {maxWidth: 200},
    },
    {kind: 'Secondary', id: 'Secondary', children: 'Secondary component'},
    {kind: 'Secondary', id: 'Secondary-disabled', children: 'Secondary disabled', disabled: true},
    {kind: 'Bold', id: 'Bold', children: 'Bold component'},
    {kind: 'SecondaryBold', id: 'SecondaryBold', children: 'Secondary bold'},
    {kind: 'Warning', id: 'Warning', children: 'Warning component'},
    {kind: 'WarningLight', id: 'WarningLight', children: 'Warning light component'},
    {kind: 'NoWrap', id: 'NoWrap', children: 'NoWrap component: long line should not wrap'},
    {
        kind: 'Escaped',
        id: 'Escaped',
        text: '{"message":"hello\\nworld","quotes":"\\"nested\\""}',
    },
];
