import {Link, type LinkProps} from '@gravity-ui/uikit';
import React, {forwardRef} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {makeRoutedURL} from '../../store/window-store';
import {useRoutedClickHandler} from '../../hooks/useRoutedClickHandler';

type LinkAdapterProps = LinkProps & {
    navigate: () => void;
};

const LinkAdapter = forwardRef<HTMLAnchorElement, LinkAdapterProps>(function LinkAdapter(
    {navigate, onClick, ...props},
    ref,
) {
    const handleClick = useRoutedClickHandler({navigate, onClick});

    return <Link {...props} onClick={handleClick} ref={ref} />;
});

export type RoutedLinkProps = LinkProps & {
    disablePreserveLocation?: boolean;
};

export const RoutedLink = forwardRef<HTMLAnchorElement, RoutedLinkProps>(function RoutedLink(
    {disablePreserveLocation, ...linkProps},
    ref,
) {
    const {href} = linkProps;
    const to = disablePreserveLocation ? href : () => makeRoutedURL(href);

    return <RouterLink {...linkProps} component={LinkAdapter} to={to} ref={ref} />;
});
