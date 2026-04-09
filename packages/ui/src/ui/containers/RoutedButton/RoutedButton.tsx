import {Button, ButtonLinkProps} from '@gravity-ui/uikit';
import React, {forwardRef} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {makeRoutedURL} from '../../store/window-store';
import {useRoutedClickHandler} from '../../hooks/useRoutedClickHandler';

type ButtonAdapterProps = ButtonLinkProps & {
    navigate: () => void;
};

const ButtonAdapter = forwardRef<HTMLAnchorElement, ButtonAdapterProps>(function ButtonAdapter(
    {navigate, onClick, ...props},
    ref,
) {
    const handleClick = useRoutedClickHandler({navigate, onClick});

    return <Button {...props} onClick={handleClick} ref={ref} />;
});

export type RoutedButtonProps = ButtonLinkProps & {
    disablePreserveLocation?: boolean;
};

export const RoutedButton = forwardRef<HTMLAnchorElement, RoutedButtonProps>(function RoutedButton(
    {disablePreserveLocation, ...buttonProps},
    ref,
) {
    const {href} = buttonProps;
    const to = disablePreserveLocation ? href : () => makeRoutedURL(href);

    return <RouterLink {...buttonProps} component={ButtonAdapter} to={to} ref={ref} />;
});
