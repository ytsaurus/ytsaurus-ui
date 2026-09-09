import type {CSSProperties} from 'react';

import type {TextProps} from './Text';

/** Default Storybook args; shared with Playwright visual tests. */
export const textStoryDefaultArgs: Pick<
    TextProps,
    'as' | 'children' | 'color' | 'bold' | 'noWrap' | 'ellipsis' | 'disabled' | 'capitalize'
> = {
    as: undefined,
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

type TextVisualCaseConfig =
    | {props: TextProps; wrapperStyle?: CSSProperties}
    | {children: string; disabled?: boolean}
    | {text: string};

/** Stable order for visual regression (light + dark each). */
export const textVisualStoryCases = {
    YTText: {
        default: {props: {children: 'YTsaurus UI text'}},
        'color-secondary': {
            props: {children: 'Secondary tone', color: 'secondary'},
        },
        'color-success': {
            props: {children: 'Success', color: 'success'},
        },
        'color-info': {props: {children: 'Info', color: 'info'}},
        'color-warning': {
            props: {children: 'Warning', color: 'warning'},
        },
        'color-warning-light': {
            props: {children: 'Warning light', color: 'warning-light'},
        },
        'color-danger': {props: {children: 'Danger', color: 'danger'}},
        bold: {props: {children: 'Bold text', bold: true}},
        disabled: {props: {children: 'Disabled', disabled: true}},
        'secondary-disabled': {
            props: {children: 'Secondary disabled', color: 'secondary', disabled: true},
        },
        capitalize: {
            props: {children: 'capitalized words', capitalize: true},
        },
        ellipsis: {
            props: {
                children: 'Very long text that should be truncated with ellipsis in a narrow box',
                ellipsis: true,
            },
            wrapperStyle: {maxWidth: 140},
        },
        'no-wrap': {
            props: {children: 'Single line: noWrap keeps this on one line', noWrap: true},
            wrapperStyle: {maxWidth: 200},
        },
    },
    Secondary: {
        default: {children: 'Secondary component'},
        disabled: {children: 'Secondary disabled', disabled: true},
    },
    Bold: {
        default: {children: 'Bold component'},
    },
    SecondaryBold: {
        default: {children: 'Secondary bold'},
    },
    Warning: {
        default: {children: 'Warning component'},
    },
    WarningLight: {
        default: {children: 'Warning light component'},
    },
    NoWrap: {
        default: {children: 'NoWrap component: long line should not wrap'},
    },
    Escaped: {
        default: {text: '{"message":"hello\\nworld","quotes":"\\"nested\\""}'},
    },
} satisfies Record<string, Record<string, TextVisualCaseConfig>>;

export type TextVisualComponentName = keyof typeof textVisualStoryCases;

export type TextVisualCase<ComponentName extends TextVisualComponentName> =
    ComponentName extends TextVisualComponentName
        ? (typeof textVisualStoryCases)[ComponentName][keyof (typeof textVisualStoryCases)[ComponentName]]
        : never;
