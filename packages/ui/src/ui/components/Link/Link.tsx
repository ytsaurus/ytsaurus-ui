import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Link as CommonLink} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {makeRoutedURL} from '../../store/window-store';

const b = block('yc-link');

export interface LinkProps {
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
}

class Link extends React.Component<LinkProps> {
    static defaultProps = {
        target: '_blank',
        routed: false,
        theme: 'normal',
    };

    render() {
        const {
            url,
            children,
            className,
            target,
            onClick,
            routed,
            theme,
            title,
            routedPreserveLocation,
        } = this.props;

        const to =
            !routed || !routedPreserveLocation
                ? url
                : () => {
                      return makeRoutedURL(url || '');
                  };

        return routed ? (
            <RouterLink className={b({view: theme}, className)} onClick={onClick} to={to || ''}>
                {children}
            </RouterLink>
        ) : (
            <CommonLink
                className={className}
                onClick={onClick}
                target={target}
                view={theme as any}
                title={title}
                href={url}
            >
                {children}
            </CommonLink>
        );
    }
}

export default Link;
