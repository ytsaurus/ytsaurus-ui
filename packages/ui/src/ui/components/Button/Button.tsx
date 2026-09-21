import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {Hotkey, type HotkeyProps, Tooltip, type TooltipProps} from '@ytsaurus/components';
import {Button as ButtonImpl, type ButtonProps as ButtonImplProps} from '@gravity-ui/uikit';

import './Button.scss';

const block = cn('yt-button');

export type ButtonCustomElementType = Exclude<React.ElementType, 'a' | 'button'> | undefined;

export type ButtonProps<T extends ButtonCustomElementType = undefined> = {
    withTooltip?: boolean;
    tooltipProps?: TooltipProps;
    hotkey?: HotkeyProps['settings'];

    inlineMargins?: boolean;
} & ButtonImplProps<T>;

export function Button(props: ButtonProps) {
    const {children, hotkey, tooltipProps, className, inlineMargins, withTooltip, ...buttonProps} =
        props;
    const buttonClassName = block({inline: inlineMargins}, className);
    const button = (
        <>
            <ButtonImpl className={buttonClassName} {...buttonProps}>
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
