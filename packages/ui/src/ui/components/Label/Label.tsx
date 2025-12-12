import React from 'react';
import block from 'bem-cn-lite';

import hammer from '../../common/hammer';

import './Label.scss';

const b = block('elements-label');

interface Props {
    className?: string;
    theme?: LabelTheme;
    type?: 'block' | 'text';
    text?: string | number;
    capitalize?: boolean;
    children?: React.ReactNode;
    hideTitle?: boolean;
}

export type LabelTheme =
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error'
    | 'info'
    | 'complementary'
    | 'misc';

function Label({
    theme = 'default',
    type = 'block',
    text,
    hideTitle,
    className,
    children,
    capitalize,
}: Props) {
    return (
        <span
            className={b({theme, type, capitalize}, className)}
            title={hideTitle ? undefined : (text as string)}
        >
            {text || children}
        </span>
    );
}

export function LabelOnOff({value, className}: {value?: boolean; className?: string}) {
    if (value === undefined) {
        return hammer.format.NO_VALUE;
    }
    const theme = value ? 'success' : 'danger';
    const text = value ? 'On' : 'Off';
    return <Label theme={theme} text={text} className={className} />;
}

export default Label;
