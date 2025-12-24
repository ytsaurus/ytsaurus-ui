import React, {HTMLAttributes} from 'react';
import cn from 'bem-cn-lite';

import './Text.scss';
import unipika from '../../common/thor/unipika';
import {UNIPIKA_ESCAPED_SETTINGS} from '../../utils';

const block = cn('yt-text');

interface Props {
    className?: string;
    children: React.ReactNode;
}

export function Secondary({children, disabled}: Props & {disabled?: boolean}) {
    return (
        <YTText color="secondary" disabled={disabled}>
            {children}
        </YTText>
    );
}

export function Bold({children}: Props) {
    return <YTText bold>{children}</YTText>;
}

export function SecondaryBold({children}: Props) {
    return (
        <YTText color="secondary" bold>
            {children}
        </YTText>
    );
}

export function Warning({children, className}: Props) {
    return (
        <YTText className={className} color="warning">
            {children}
        </YTText>
    );
}

export function WarningLight({children, className}: Props) {
    return (
        <YTText className={className} color="warning-light">
            {children}
        </YTText>
    );
}

export function NoWrap({children}: Props) {
    return <YTText noWrap>{children}</YTText>;
}

export function Escaped({text, onClick}: {text: string; onClick?: (e: React.MouseEvent) => void}) {
    const textNode = unipika.prettyprint(text, {
        ...UNIPIKA_ESCAPED_SETTINGS,
        asHTML: true,
    });
    return <YTText escaped onClick={onClick} dangerouslySetInnerHTML={{__html: textNode}} />;
}

export type TextProps = Pick<
    HTMLAttributes<HTMLSpanElement>,
    'className' | 'onClick' | 'role' | 'dangerouslySetInnerHTML' | 'children'
> & {
    ellipsis?: boolean;
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'warning-light' | 'danger';
    disabled?: boolean;
    bold?: boolean;
    noWrap?: boolean;
    escaped?: boolean;
    capitalize?: boolean;
};

export function YTText({
    className,
    color,
    ellipsis,
    disabled,
    bold,
    noWrap,
    escaped,
    capitalize,
    children,
    ...rest
}: TextProps) {
    return (
        <span
            className={block(
                {
                    color,
                    ellipsis,
                    bold,
                    disabled,
                    'no-wrap': noWrap,
                    escaped,
                    clickable: Boolean(rest.onClick),
                    capitalize,
                },
                className,
            )}
            role={rest.onClick ? 'button' : rest.role}
            {...rest}
        >
            {children}
        </span>
    );
}
