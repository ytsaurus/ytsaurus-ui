import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';
import {CopyToClipboard} from '@gravity-ui/uikit';
import copyToClipboard from 'copy-to-clipboard';
import cn from 'bem-cn-lite';

import Button from '../Button/Button';

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
    };

    iconByState = {
        pending: this.props.awesome,
        success: 'check',
        error: 'times',
    };

    handleHotkey = () => {
        const button = findDOMNode(this.islandsButton); // eslint-disable-line react/no-find-dom-node

        if (button) {
            button.click();
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

    onCopy = (text, result) => {
        const {shiftText, onCopy} = this.props;
        if (window.event.shiftKey && shiftText) {
            text = shiftText;
            copyToClipboard(shiftText);
        }
        if ('function' === typeof onCopy) {
            onCopy(text, result);
        }
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
                    <CopyToClipboard text={text} onCopy={this.onCopy} timeout={timeout}>
                        {(state) =>
                            buttonText ? (
                                <Button
                                    {...buttonProps}
                                    ref={(ref) => {
                                        this.islandsButton = ref;
                                    }}
                                    onClick={function (evt) {
                                        evt.preventDefault();
                                        evt.stopPropagation();
                                    }}
                                >
                                    <Icon awesome={this.iconByState[state]} face={face} />
                                    {buttonText}
                                </Button>
                            ) : (
                                <Button
                                    {...buttonProps}
                                    ref={(ref) => {
                                        this.islandsButton = ref;
                                    }}
                                    onClick={function (evt) {
                                        evt.preventDefault();
                                        evt.stopPropagation();
                                    }}
                                >
                                    <Icon awesome={this.iconByState[state]} face={face} />
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
