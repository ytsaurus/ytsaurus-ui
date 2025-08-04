import React from 'react';
import Link, {LinkProps} from '../../components/Link/Link';

import Icon, {IconProps} from '../Icon/Icon';

import i18n from './i18n';

interface Props {
    className?: string;
    theme?: LinkProps['theme'];
    face?: IconProps['face'];
    url?: string;
    title?: string;
    children?: React.ReactNode;
    hideIcon?: boolean;
    wrapContent?: (node: React.ReactNode) => React.ReactNode;
}

function ChartLink(props: Props) {
    const {className, url, title, theme, children, hideIcon, face, wrapContent} = props;

    if (!url) {
        return null;
    }

    const icon = hideIcon ? null : <Icon awesome="chart-bar" face={face} />;
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
            theme={theme}
            url={url}
            title={title ?? i18n('View')}
        >
            {wrapContent ? wrapContent(content) : content}
        </Link>
    );
}

export default React.memo(ChartLink);
