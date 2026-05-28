import React from 'react';
import {Link, type LinkProps} from '@gravity-ui/uikit';

import Icon from '../Icon/Icon';

import i18n from './i18n';

interface Props {
    className?: string;
    theme?: 'ghost';
    url?: string;
    title?: string;
    children?: React.ReactNode;
    hideIcon?: boolean;
    wrapContent?: (node: React.ReactNode) => React.ReactNode;
}

function ChartLink(props: Props) {
    const {className, url, title, theme, children, hideIcon, wrapContent} = props;

    if (!url) {
        return null;
    }

    const icon = hideIcon ? null : <Icon awesome="chart-bar" />;
    const content = children ? (
        <React.Fragment>
            {icon}
            {children}
        </React.Fragment>
    ) : (
        icon
    );

    return (
        <Link
            className={className}
            target="_blank"
            view={theme as LinkProps['view']}
            href={url}
            title={title ?? i18n('View')}
        >
            {wrapContent ? wrapContent(content) : content}
        </Link>
    );
}

export default React.memo(ChartLink);
