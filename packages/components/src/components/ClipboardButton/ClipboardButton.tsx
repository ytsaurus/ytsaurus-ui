import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import {
    Button,
    ButtonButtonProps,
    ButtonProps,
    CopyToClipboard,
    Icon,
    IconProps,
} from '@gravity-ui/uikit';
import FilesIcon from '@gravity-ui/icons/svgs/files.svg';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';

import {Hotkey} from '../Hotkey';
import {Tooltip} from '../Tooltip';

import './ClipboardButton.scss';

const block = cn('yt-clipboard-button');

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
    iconSize?: IconProps['size'];
};

export class ClipboardButton extends Component<ClipboardButtonProps> {
    static defaultProps: Partial<ClipboardButtonProps> = {
        size: 'm',
        hotkeyScope: 'all',
        timeout: 500,
        view: 'outlined',
    };

    iconByState = {
        pending: this.props.icon || FilesIcon,
        success: CheckIcon,
        error: XmarkIcon,
    };

    buttonRef = React.createRef<HTMLButtonElement>();
    shiftKeyPressed = false;

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

    getTextToCopy = () => {
        const {text, shiftText} = this.props;
        let resText = text.toString() || '';
        if (this.shiftKeyPressed && shiftText) {
            resText = shiftText;
        }

        return resText;
    };

    onClickCapture = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        this.shiftKeyPressed = event.shiftKey;
    };

    onCopy = (text: string) => {
        const {onCopy} = this.props;
        if ('function' === typeof onCopy) {
            onCopy(text);
        }
    };

    onClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    render() {
        const {
            buttonText,
            hotkey,
            timeout,
            hoverContent,
            className,
            visibleOnRowHover,
            inlineMargins,
            iconSize,
            ...buttonProps
        } = this.props;

        const resultIconSize = iconSize || 13;
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
                    <CopyToClipboard
                        text={this.getTextToCopy}
                        timeout={timeout}
                        onCopy={this.onCopy}
                    >
                        {(state) =>
                            buttonText ? (
                                <Button
                                    {...(buttonProps as ButtonButtonProps)}
                                    view={buttonView}
                                    ref={this.buttonRef}
                                    onClick={this.onClick}
                                    onClickCapture={this.onClickCapture}
                                >
                                    <Icon data={this.iconByState[state]} size={resultIconSize} />
                                    {buttonText}
                                </Button>
                            ) : (
                                <Button
                                    {...(buttonProps as ButtonButtonProps)}
                                    view={buttonView}
                                    ref={this.buttonRef}
                                    onClick={this.onClick}
                                    onClickCapture={this.onClickCapture}
                                >
                                    <Icon data={this.iconByState[state]} size={resultIconSize} />
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
