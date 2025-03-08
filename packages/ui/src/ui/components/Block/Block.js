import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import ErrorDetails from '../../components/ErrorDetails/ErrorDetails';
import HelpLink from '../../components/HelpLink/HelpLink';
import Icon from '../Icon/Icon';

import hammer from '../../common/hammer';

import './Block.scss';
import FormattedText from '../formatters/FormattedText';
import {rumLogError} from '../../rum/rum-counter';

const b = block('yt-error-block');

function ErrorLogger({error, type}) {
    React.useEffect(() => {
        if (error && type === 'error') {
            rumLogError(
                {
                    block: 'ErrorBlock',
                },
                error,
            );
        }
    }, [error]);
    return null;
}

export default class ErrorBlock extends Component {
    static propTypes = {
        error: ErrorDetails.propTypes.error,
        message: PropTypes.node,
        helpURL: PropTypes.string,
        type: PropTypes.oneOf(['alert', 'error']),
        className: PropTypes.string,
        settings: PropTypes.object,
        topMargin: PropTypes.oneOf(['none', 'half']),
        bottomMargin: PropTypes.bool,
        header: PropTypes.node,
        maxCollapsedDepth: PropTypes.number, // max depth of collapsed inner errors
        disableLogger: PropTypes.bool,
    };

    static defaultProps = {
        type: 'error',
    };

    renderIcon() {
        const {type} = this.props;
        const className = b('icon');
        const iconName = type === 'alert' ? 'exclamation-triangle' : 'exclamation-circle';
        return (
            <div className={className}>
                <Icon awesome={iconName} />
            </div>
        );
    }

    renderMessage() {
        const {message} = this.props;
        const className = b('message');
        return (
            <div className={className}>
                {typeof message !== 'string' ? message : <FormattedText text={message} />}
            </div>
        );
    }

    renderBody() {
        const {error, settings, maxCollapsedDepth} = this.props;
        const className = b('body');
        return (
            <div className={className}>
                {this.renderMessage()}
                {error && (
                    <ErrorDetails
                        error={error}
                        settings={settings}
                        maxCollapsedDepth={maxCollapsedDepth}
                    />
                )}
            </div>
        );
    }

    renderHeading() {
        const {type, header} = this.props;

        const className = b('heading');

        return <div className={className}>{header || hammer.format['ReadableField'](type)}</div>;
    }

    renderHelp() {
        const className = b('help');

        const {helpURL} = this.props;

        return (
            helpURL && (
                <div className={className}>
                    <HelpLink url={helpURL} />
                </div>
            )
        );
    }

    renderCopy() {
        const {error} = this.props;
        const className = b('copy');
        const text = JSON.stringify(error, null, 4);

        return (
            <div className={className}>
                <ClipboardButton title="Copy error" view="flat-secondary" text={text} size="l" />
            </div>
        );
    }

    render() {
        const {type, className, topMargin, bottomMargin, disableLogger} = this.props;

        return (
            <React.Fragment>
                <div
                    className={b(
                        {'top-margin': topMargin, ['bottom-margin']: bottomMargin, type},
                        className,
                    )}
                >
                    {this.renderIcon()}
                    {this.renderHeading()}
                    {this.renderBody()}
                    {this.renderHelp()}
                    {this.renderCopy()}
                </div>
                {!disableLogger && <ErrorLogger error={this.props.error} type={type} />}
            </React.Fragment>
        );
    }
}
