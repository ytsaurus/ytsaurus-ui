import React from 'react';
import block from 'bem-cn-lite';

import ErrorDetails, {ErrorDetailsProps} from '../../components/ErrorDetails/ErrorDetails';
import HelpLink from '../../components/HelpLink/HelpLink';
import Icon from '../Icon/Icon';

import hammer from '../../common/hammer';

import './Block.scss';
import FormattedText from '../formatters/FormattedText';
import {rumLogError} from '../../rum/rum-counter';
import {ErrorToClipboardButton} from '../../components/ErrorToClipboardButton/ErrorToClipboardButton';

const b = block('yt-error-block');

function ErrorLogger({error, type}: Pick<YTErrorBlockProps, 'error' | 'type'>) {
    React.useEffect(() => {
        if (error && type === 'error') {
            rumLogError(
                {
                    block: 'ErrorBlock',
                },
                error as Error,
            );
        }
    }, [error]);
    return null;
}

export type YTErrorBlockProps = {
    className?: string;
    topMargin?: 'none' | 'half';
    bottomMargin?: boolean;

    error?: ErrorDetailsProps['error'];
    settings?: ErrorDetailsProps['settings'];

    header?: React.ReactNode;
    message?: React.ReactNode;

    helpURL?: string;
    type?: 'alert' | 'error';
    maxCollapsedDepth?: number; // max depth of collapsed inner errors
    disableLogger?: boolean;
};

export class YTErrorBlock extends React.Component<YTErrorBlockProps> {
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
        const {error, settings} = this.props;
        const className = b('copy');

        return (
            <div className={className}>
                <ErrorToClipboardButton error={error} settings={settings} size="l" />
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
