import React from 'react';
import cn from 'bem-cn-lite';
import unipika from '../../utils/unipika';
import './Text.scss';

export const UNIPIKA_ESCAPED_SETTINGS = {
    asHTML: false,
    indent: 0,
    break: false,
    showDecoded: true,
    escapeWhitespace: true,
    format: 'raw-json',
};

const block = cn('yt-text');

type Props = {
    className?: string;
    children: React.ReactNode;
};

type TextTag = keyof React.JSX.IntrinsicElements;

type TextOwnProps<T extends TextTag> = {
    as?: T;
    ellipsis?: boolean;
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'warning-light' | 'danger';
    disabled?: boolean;
    bold?: boolean;
    noWrap?: boolean;
    escaped?: boolean;
    capitalize?: boolean;
};

type TextRef<T extends TextTag> = React.ComponentPropsWithRef<T>['ref'];

export type TextProps<T extends TextTag = 'span'> = TextOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof TextOwnProps<T>>;

export const YTText = React.forwardRef(
    <T extends TextTag = 'span'>(
        {
            as,
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
        }: TextProps<T>,
        ref: TextRef<T>,
    ) => {
        const Tag = (as || 'span') as React.ElementType;

        return (
            <Tag
                ref={ref}
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
            </Tag>
        );
    },
) as (<T extends TextTag = 'span'>(
    props: TextProps<T> & {ref?: TextRef<T>},
) => React.ReactElement) & {displayName: string};

YTText.displayName = 'YTText';

export const Secondary = ({children, disabled}: Props & {disabled?: boolean}) => {
    return (
        <YTText color="secondary" disabled={disabled}>
            {children}
        </YTText>
    );
};

export const Bold = ({children}: Props) => {
    return <YTText bold>{children}</YTText>;
};

export const SecondaryBold = ({children}: Props) => {
    return (
        <YTText color="secondary" bold>
            {children}
        </YTText>
    );
};

export const Warning = ({children, className}: Props) => {
    return (
        <YTText className={className} color="warning">
            {children}
        </YTText>
    );
};

export const WarningLight = ({children, className}: Props) => {
    return (
        <YTText className={className} color="warning-light">
            {children}
        </YTText>
    );
};

export const NoWrap = ({children}: Props) => {
    return <YTText noWrap>{children}</YTText>;
};

export const Escaped = ({
    text,
    onClick,
}: {
    text: string;
    onClick?: (e: React.MouseEvent) => void;
}) => {
    const textNode = unipika.prettyprint(text, {
        ...UNIPIKA_ESCAPED_SETTINGS,
        asHTML: true,
    });

    return <YTText escaped onClick={onClick} dangerouslySetInnerHTML={{__html: textNode}} />;
};
