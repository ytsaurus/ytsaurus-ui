import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import {
    Button,
    ButtonButtonProps,
    ButtonProps,
    CopyToClipboard,
    Icon,
    IconProps,
    copyTextToClipboard,
} from '@gravity-ui/uikit';
import CopyIcon from '@gravity-ui/icons/svgs/copy.svg';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';

import {Hotkey} from '../Hotkey';
import {Tooltip} from '../Tooltip';

import './ClipboardButton.scss';

const block = cn('yt-clipboard-button');

/** 'clear' is a custom view: only affects wrapper styling (SCSS), Button receives 'flat' */
type ClipboardButtonProps = Omit<ButtonProps, 'onCopy' | 'view'> & {
    view?: ButtonProps['view'] | 'clear';
    className?: string;
    text: string | number;
    shiftText?: string;
    buttonText?: string | null;
    title?: string;
    hoverContent?: React.ReactNode;
    hotkey?: string;
    hotkeyScope?: string;
    onCopy?: (text: string) => void;
    timeout?: number;
    visibleOnRowHover?: boolean;
    inlineMargins?: boolean;
    icon?: IconProps['data'];
};

export class ClipboardButton extends Component<ClipboardButtonProps> {
    static defaultProps: Partial<ClipboardButtonProps> = {
        size: 'm',
        hotkeyScope: 'all',
        timeout: 500,
        view: 'outlined',
    };

    iconByState = {
        pending: this.props.icon || CopyIcon,
        success: CheckIcon,
        error: XmarkIcon,
    };

    buttonRef = React.createRef<HTMLButtonElement>();

    handleHotkey = () => {
        const {current} = this.buttonRef;
        if (current?.click) {
            current.click();
        }
    };

    renderHotkey() {
        const {hotkey, hotkeyScope} = this.props;
        if (!hotkey || !hotkeyScope) {
            return null;
        }

        return (
            <Hotkey
                settings={[
                    {
                        keys: hotkey,
                        scope: hotkeyScope,
                        handler: this.handleHotkey,
                    },
                ]}
            />
        );
    }

    onClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const {text, shiftText, onCopy} = this.props;
        let resText = text.toString();
        if (event?.shiftKey && shiftText) {
            resText = shiftText;
            copyTextToClipboard(resText);
        }
        if ('function' === typeof onCopy) {
            onCopy(resText);
        }

        event.preventDefault();
        event.stopPropagation();
    };

    render() {
        const {
            text,
            buttonText,
            hotkey,
            timeout,
            hoverContent,
            className,
            visibleOnRowHover,
            inlineMargins,
            ...buttonProps
        } = this.props;

        const iconSize = buttonProps.size === 'm' ? 13 : undefined;
        const buttonView =
            this.props.view === 'clear' ? 'flat' : (this.props.view as ButtonProps['view']);

        return (
            <span
                className={block(
                    {
                        'visbile-on-row-hover': visibleOnRowHover,
                        'inline-margin': inlineMargins,
                        view: this.props.view,
                    },
                    className,
                )}
            >
                <Tooltip content={hoverContent}>
                    <CopyToClipboard text={text.toString()} timeout={timeout}>
                        {(state) =>
                            buttonText ? (
                                <Button
                                    {...(buttonProps as ButtonButtonProps)}
                                    view={buttonView}
                                    ref={this.buttonRef}
                                    onClick={this.onClick}
                                >
                                    <Icon data={this.iconByState[state]} size={iconSize} />
                                    {buttonText}
                                </Button>
                            ) : (
                                <Button
                                    {...(buttonProps as ButtonButtonProps)}
                                    view={buttonView}
                                    ref={this.buttonRef}
                                    onClick={this.onClick}
                                >
                                    <Icon data={this.iconByState[state]} size={iconSize} />
                                </Button>
                            )
                        }
                    </CopyToClipboard>
                    {hotkey && this.renderHotkey()}
                </Tooltip>
            </span>
        );
    }
}
