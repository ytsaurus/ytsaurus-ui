import React from 'react';
import block from 'bem-cn-lite';
import {AxiosError} from 'axios';
import cloneDeepWith_ from 'lodash/cloneDeepWith';

import {Button, Flex, Text} from '@gravity-ui/uikit';

import hammer from '../../common/hammer';

import {YTError, YTErrorRaw} from '../../../@types/types';

import ErrorDetails, {ErrorDetailsProps} from '../../components/ErrorDetails/ErrorDetails';
import HelpLink from '../../components/HelpLink/HelpLink';
import FormattedText from '../formatters/FormattedText';
import {rumLogError} from '../../rum/rum-counter';
import {ErrorToClipboardButton} from '../../components/ErrorToClipboardButton/ErrorToClipboardButton';
import {showErrorPopup} from '../../utils/utils';

import Icon from '../Icon/Icon';

import i18n from './i18n';

import './Block.scss';

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
    view?: 'compact';

    error?: ErrorDetailsProps['error'];
    settings?: ErrorDetailsProps['settings'];

    header?: React.ReactNode;
    message?: React.ReactNode;

    helpURL?: string;
    type?: 'alert' | 'error' | 'info';
    maxCollapsedDepth?: number; // max depth of collapsed inner errors
    defaultExpandedCount?: number;
    disableLogger?: boolean;
};

export function YTErrorBlock({error, ...props}: YTErrorBlockProps) {
    const e = React.useMemo(() => {
        return cloneDeepWith_(error, (value) => {
            // Some UI-side errors might contain fields with `undefined`,
            // such values might not be rendered as yson, so we have to replace them with null
            return value === undefined ? null : undefined;
        });
    }, [error]);

    return <YTErrorBlockImpl {...props} error={e} />;
}

class YTErrorBlockImpl extends React.Component<YTErrorBlockProps> {
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

    renderCompactBody() {
        const {message, error} = this.props;
        return (
            <>
                {message ?? (error ? ErrorDetails.renderMessage(error as YTErrorRaw) : undefined)}
                <Button
                    style={{width: 'fit-content'}}
                    view={'outlined'}
                    size={'l'}
                    onClick={() =>
                        showErrorPopup(error as YTError | AxiosError, {hideOopsMsg: true})
                    }
                >
                    <Text color={'secondary'}>Details</Text>
                </Button>
            </>
        );
    }

    renderBody() {
        const {view, error, settings, maxCollapsedDepth, defaultExpandedCount} = this.props;
        const className = b('body');

        return (
            <Flex direction={'column'} gap={2} className={className}>
                {view === 'compact' ? (
                    this.renderCompactBody()
                ) : (
                    <>
                        {this.renderMessage()}
                        {error && (
                            <ErrorDetails
                                error={error}
                                settings={settings}
                                maxCollapsedDepth={maxCollapsedDepth}
                                defaultExpadedCount={defaultExpandedCount}
                            />
                        )}
                    </>
                )}
            </Flex>
        );
    }

    renderHeading() {
        const {type, header} = this.props;

        const className = b('heading');

        return (
            <div className={className}>
                {header || hammer.format['ReadableField'](type ? i18n(type) : undefined)}
            </div>
        );
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

        return (
            <div className={className}>
                <ErrorToClipboardButton error={error} size="l" />
            </div>
        );
    }

    render() {
        const {type, className, topMargin, bottomMargin, disableLogger, error} = this.props;

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
                    {error && this.renderCopy()}
                </div>
                {!disableLogger && <ErrorLogger error={this.props.error} type={type} />}
            </React.Fragment>
        );
    }
}
