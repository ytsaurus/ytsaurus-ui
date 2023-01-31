import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';

import Hotkey, {HotkeyProps} from '../../components/Hotkey/Hotkey';
import {Button as ButtonImpl, ButtonProps as ButtonImplProps} from '@gravity-ui/uikit';
import {Tooltip, TooltipProps} from '../Tooltip/Tooltip';

export interface ButtonProps extends ButtonImplProps {
    withTooltip?: boolean;
    tooltipProps?: TooltipProps;
    hotkey?: HotkeyProps['settings'];
}

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
            ...buttonProps
        } = this.props;

        return (
            <Fragment>
                <ButtonImpl {...buttonProps}>{children}</ButtonImpl>
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
