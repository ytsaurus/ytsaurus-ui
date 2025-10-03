import React from 'react';
import {AxiosError, isAxiosError} from 'axios';
import {Flex} from '@gravity-ui/uikit';
import Link from '../../components/Link/Link';
import block from 'bem-cn-lite';
import ypath from '../../common/thor/ypath';
import unipika from '../../common/thor/unipika';

import map_ from 'lodash/map';

import {YTErrorRaw} from '../../../@types/types';

import Icon from '../Icon/Icon';
import Tabs from '../../components/Tabs/Tabs';
import Yson from '../../components/Yson/Yson';

import './ErrorDetails.scss';
import {unescapeSlashX} from '../../utils/utils';
import FormattedText from '../../components/formatters/FormattedText';
import {isYTError} from '../../../shared/utils';
import {UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';
import {ErrorToClipboardButton} from '../../components/ErrorToClipboardButton/ErrorToClipboardButton';

const b = block('elements-error-details');

export type ErrorDetailsProps = {
    error: YTErrorRaw<{attributes?: object}> | AxiosError;
    settings?: UnipikaSettings;
    maxCollapsedDepth?: number;
    defaultExpadedCount?: number;
};

type State = {
    showDetails: boolean;
    currentTab: 'attributes' | 'details' | 'stderrs';
};

export default class ErrorDetails extends React.Component<ErrorDetailsProps, State> {
    static prepareDefaultTab(props: ErrorDetailsProps) {
        const {attributes} = props.error as YTErrorRaw;
        let details, stderrs;

        if (attributes) {
            ({details, stderrs} = attributes);
        }

        if (typeof details !== 'undefined') {
            return 'details';
        } else if (typeof stderrs !== 'undefined') {
            return 'stderrs';
        } else {
            return 'attributes';
        }
    }

    static renderMessage(error: YTErrorRaw) {
        const {message, code} = error;

        const value = ypath.getValue(message);
        let text = value;
        if ('string' === typeof text) {
            const msg = unescapeSlashX(text);
            text = <FormattedText text={msg} />;
        }
        return (
            <span className={b('message')}>
                {text}
                {code !== undefined && <React.Fragment>[{ypath.getValue(code)}]</React.Fragment>}
            </span>
        );
    }

    state: State = {
        showDetails: Boolean(this.props.defaultExpadedCount),
        currentTab: ErrorDetails.prepareDefaultTab(this.props),
    };

    get TABS() {
        return [
            {
                value: 'details' as const,
                text: 'Details',
                show: false,
            },
            {
                value: 'stderrs' as const,
                text: 'Stderrs',
                show: false,
            },
            {
                value: 'attributes' as const,
                text: 'Attributes',
                show: true,
            },
        ];
    }

    toggleDetails = () => {
        this.setState({
            showDetails: !this.state.showDetails,
        });
    };

    changeCurrentTab = (tabName: State['currentTab']) => {
        this.setState({
            currentTab: tabName,
        });
    };

    prepareTabs() {
        const {attributes} = this.props.error as YTErrorRaw;

        return map_(this.TABS, (tab) => {
            if (typeof attributes?.[tab.value] !== 'undefined') {
                return {...tab, show: true};
            } else {
                return {...tab};
            }
        });
    }

    renderTabs() {
        const {error} = this.props;
        const {currentTab} = this.state;

        const items = this.prepareTabs();

        return (
            <div className={b('tabs')}>
                <Tabs onTabChange={this.changeCurrentTab} active={currentTab} items={items} />
                <ErrorToClipboardButton size="s" error={error} />
            </div>
        );
    }

    renderTabContent() {
        const {currentTab} = this.state;

        const {error, settings} = this.props;
        const {attributes} = error as YTErrorRaw;
        let details, stderrs;
        if (attributes) {
            ({details, stderrs} = attributes);
        }

        const className = b('details-content');
        const codeClassName = block('elements-code')({theme: 'default'});

        return (
            <div className={className}>
                {currentTab === 'attributes' && (
                    <Yson value={attributes} settings={unipika.prepareSettings(settings)} />
                )}
                {currentTab === 'details' && (
                    <pre className={codeClassName}>{details as React.ReactNode}</pre>
                )}
                {currentTab === 'stderrs' && (
                    <pre className={codeClassName}>{stderrs as React.ReactNode}</pre>
                )}
            </div>
        );
    }

    renderDetails() {
        return (
            <div className={b('details')}>
                {this.renderTabs()}
                {this.renderTabContent()}
            </div>
        );
    }

    renderInnerErrors() {
        const {settings, defaultExpadedCount = 0, maxCollapsedDepth = Infinity} = this.props;

        const {inner_errors: innerErrors = []} = this.props.error as YTErrorRaw;
        if (isAxiosError<YTErrorRaw>(this.props.error)) {
            const {response} = this.props.error;
            const innerError = isYTError(response?.data)
                ? response.data
                : {attributes: response?.data as YTErrorRaw['attributes'], message: 'Error'};
            innerErrors.push(innerError);
        }

        const allowToShowInnerErrors = this.state.showDetails || maxCollapsedDepth > 0;

        return (
            innerErrors &&
            allowToShowInnerErrors &&
            innerErrors.length > 0 && (
                <div className={b('inner-errors')}>
                    {innerErrors.map((error, index) => (
                        <ErrorDetails
                            key={index}
                            error={error}
                            {...{settings}}
                            defaultExpadedCount={defaultExpadedCount ? defaultExpadedCount - 1 : 0}
                            maxCollapsedDepth={
                                this.state.showDetails ? Infinity : maxCollapsedDepth - 1
                            }
                        />
                    ))}
                </div>
            )
        );
    }

    renderToggler() {
        const {showDetails} = this.state;

        return (
            <Icon
                className={b('error-toggler')}
                awesome={showDetails ? 'angle-up' : 'angle-right'}
                size="l"
            />
        );
    }

    renderError() {
        const {attributes} = this.props.error as YTErrorRaw;
        const {showDetails} = this.state;

        return (
            <div className={b('error')}>
                {typeof attributes !== 'undefined' ? (
                    <Flex direction="column">
                        <Link theme="primary" onClick={this.toggleDetails}>
                            {this.renderToggler()}
                            {ErrorDetails.renderMessage(this.props.error as YTErrorRaw)}
                        </Link>
                        <div className={'toggle-subject'}>
                            {showDetails && this.renderDetails()}
                        </div>
                    </Flex>
                ) : (
                    ErrorDetails.renderMessage(this.props.error as YTErrorRaw)
                )}
            </div>
        );
    }

    render() {
        return (
            <div className={b()}>
                {this.renderError()}
                {this.renderInnerErrors()}
            </div>
        );
    }
}
