import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {Hotkey, type HotkeyProps, Tooltip, type TooltipProps} from '@ytsaurus/components';
import {Button as ButtonImpl, type ButtonProps as ButtonImplProps} from '@gravity-ui/uikit';

import {type ButtonActionRole, useThemeProps} from '../ThemePropsConfigProvider';

import './Button.scss';

const block = cn('yt-button');

export type ButtonCustomElementType = Exclude<React.ElementType, 'a' | 'button'> | undefined;

export type ButtonProps<T extends ButtonCustomElementType = undefined> = {
    actionRole?: ButtonActionRole;
    withTooltip?: boolean;
    tooltipProps?: TooltipProps;
    hotkey?: HotkeyProps['settings'];

    inlineMargins?: boolean;
} & ButtonImplProps<T>;

export function Button(props: ButtonProps) {
    const {
        actionRole,
        children,
        hotkey,
        tooltipProps,
        className,
        inlineMargins,
        view,
        withTooltip,
        ...buttonProps
    } = props;
    const buttonThemeProps = useThemeProps('button', {actionRole, view});

    const buttonClassName = block(
        {inline: inlineMargins},
        [className, buttonThemeProps.className].filter(Boolean).join(' '),
    );
    const buttonView = buttonThemeProps.view ?? view;

    const button = (
        <>
            <ButtonImpl {...buttonProps} className={buttonClassName} view={buttonView}>
                {children}
            </ButtonImpl>
            {hotkey && <Hotkey settings={hotkey} />}
        </>
    );

    return withTooltip ? <Tooltip {...tooltipProps}>{button}</Tooltip> : button;
}

Button.propTypes = {
    hotkey: PropTypes.arrayOf(
        PropTypes.shape({
            keys: PropTypes.string.isRequired,
            scope: PropTypes.string.isRequired,
            handler: PropTypes.func.isRequired,
        }),
    ),
    withTooltip: PropTypes.bool,
    tooltipProps: PropTypes.object,
    children: PropTypes.any,
};

Button.defaultProps = {
    withTooltip: false,
    size: 'm',
    view: 'outlined',
};

export default Button;

export function SelectButton(props: ButtonProps & Pick<ButtonImplProps, 'selected'>) {
    const {selected, view} = props;
    return <Button {...props} view={selected ? 'normal' : view} />;
}
