import React, {Component} from 'react';
import PropTypes from 'prop-types';
import copyToClipboard from 'copy-to-clipboard';
import cn from 'bem-cn-lite';

import {Button, CopyToClipboard} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';
import Hotkey from '../../components/Hotkey/Hotkey';
import {Tooltip} from '../Tooltip/Tooltip';

import './ClipboardButton.scss';

const block = cn('yt-clipboard-button');

export default class ClipboardButton extends Component {
    static propTypes = {
        className: PropTypes.string,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        shiftText: PropTypes.string,
        buttonText: PropTypes.string,
        view: PropTypes.string,
        size: PropTypes.oneOf(['xs', 's', 'm', 'l']),
        title: PropTypes.string,
        // do not use this property with title
        hoverContent: PropTypes.node,
        mix: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        hotkey: PropTypes.string,
        hotkeyScope: PropTypes.string,
        onCopy: PropTypes.func,
        awesome: PropTypes.string,
        face: PropTypes.string,
        timeout: PropTypes.number,
        visibleOnRowHover: PropTypes.bool,
        inlineMargins: PropTypes.bool,
    };

    static defaultProps = {
        size: 'm',
        hotkeyScope: 'all',
        awesome: 'copy',
        face: 'regular',
        buttonText: null,
        timeout: 500,
        view: 'outlined',
    };

    iconByState = {
        pending: this.props.awesome,
        success: 'check',
        error: 'times',
    };

    buttonRef = React.createRef();

    handleHotkey = () => {
        const {current} = this.buttonRef;
        if (current?.click) {
            current.click();
        }
    };

    renderHotkey() {
        const {hotkey, hotkeyScope} = this.props;

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

    onClick = (event) => {
        const {text, shiftText, onCopy} = this.props;
        let resText = text;
        if (event?.shiftKey && shiftText) {
            resText = shiftText;
            copyToClipboard(resText);
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
            face,
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
                    <CopyToClipboard text={text} timeout={timeout}>
                        {(state) =>
                            buttonText ? (
                                <Button
                                    {...buttonProps}
                                    buttonRef={this.buttonRef}
                                    onClick={this.onClick}
                                >
                                    <Icon
                                        awesome={this.iconByState[state]}
                                        face={face}
                                        size={iconSize}
                                    />
                                    {buttonText}
                                </Button>
                            ) : (
                                <Button
                                    {...buttonProps}
                                    ref={this.buttonRef}
                                    onClick={this.onClick}
                                >
                                    <Icon
                                        awesome={this.iconByState[state]}
                                        face={face}
                                        size={iconSize}
                                    />
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
