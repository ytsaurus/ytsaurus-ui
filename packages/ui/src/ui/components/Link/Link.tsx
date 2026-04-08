import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Link as CommonLink} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {makeRoutedURL} from '../../store/window-store';
import {ClickableText, ClickableTextProps} from '../ClickableText/ClickableText';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import './Link.scss';

const gBlock = cn('g-link');
const block = cn('yt-link');

const THEME_TO_COLOR: Record<
    Exclude<LinkProps['theme'], ClickableTextProps['color']>,
    ClickableTextProps['color']
> = {
    normal: 'info',
    ghost: 'secondary',
};

export type LinkProps = {
    url?: string;
    onClick?: (e: React.MouseEvent) => void;
    onMouseUp?: (e: React.MouseEvent) => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    target?: '_blank';
    children: React.ReactNode;
    routed?: boolean;
    theme?: 'normal' | 'primary' | 'secondary' | 'ghost';
    className?: string;
    title?: string;
    routedPreserveLocation?: boolean;
    hasExternalIcon?: boolean;
};

export const Link = ({
    url,
    children,
    className,
    target = '_blank',
    onClick,
    routed = false,
    theme = 'normal',
    title,
    routedPreserveLocation,
    hasExternalIcon,
}: LinkProps) => {
    const content = (
        <>
            {children}
            {hasExternalIcon && (
                <span style={{paddingLeft: '2px'}}>
                    <ArrowUpRightFromSquare className={block('external-icon')} />
                </span>
            )}
        </>
    );

    if (!url) {
        return (
            <ClickableText className={className} onClick={onClick} color={textColor(theme)}>
                {content}
            </ClickableText>
        );
    }

    if (routed) {
        const to = routedPreserveLocation ? () => makeRoutedURL(url) : url;

        return (
            <RouterLink className={gBlock({view: theme}, className)} onClick={onClick} to={to}>
                {content}
            </RouterLink>
        );
    }

    return (
        <CommonLink
            className={className}
            onClick={onClick}
            target={target}
            view={theme as Exclude<typeof theme, 'ghost'>}
            title={title}
            href={url}
        >
            {content}
        </CommonLink>
    );
};

function textColor(theme: LinkProps['theme']): ClickableTextProps['color'] {
    const converted = THEME_TO_COLOR[theme as keyof typeof THEME_TO_COLOR];
    return converted ?? (theme as Exclude<typeof theme, keyof typeof THEME_TO_COLOR>);
}

export default Link;
