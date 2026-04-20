import React, {Component, Fragment} from 'react';
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

export default class Button extends Component<ButtonProps> {
    static propTypes = {
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

    static defaultProps = {
        withTooltip: false,
        size: 'm',
        view: 'outlined',
    };

    renderSimpleButton() {
        const {
            children,
            hotkey,
            // Do not pass tooltipProps with buttonProps into IslandsButton
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            tooltipProps,
            className,
            inlineMargins,
            withTooltip: _withTooltip,
            ...buttonProps
        } = this.props;

        return (
            <Fragment>
                <ButtonImpl className={block({inline: inlineMargins}, className)} {...buttonProps}>
                    {children}
                </ButtonImpl>
                {hotkey && <Hotkey settings={hotkey} />}
            </Fragment>
        );
    }

    renderButtonWithTooltip() {
        const {tooltipProps} = this.props;

        return <Tooltip {...tooltipProps}>{this.renderSimpleButton()}</Tooltip>;
    }

    render() {
        const {withTooltip} = this.props;

        return withTooltip ? this.renderButtonWithTooltip() : this.renderSimpleButton();
    }
}

export function SelectButton(props: ButtonProps & Pick<ButtonImplProps, 'selected'>) {
    const {selected, view} = props;
    return <Button {...props} view={selected ? 'normal' : view} />;
}
