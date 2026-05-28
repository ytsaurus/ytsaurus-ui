import React from 'react';
import {type AxiosError, isAxiosError} from 'axios';

import i18n from './i18n';
import {Flex} from '@gravity-ui/uikit';
import Link from '../../containers/Link/Link';
import block from 'bem-cn-lite';
import ypath from '../../common/thor/ypath';

import map_ from 'lodash/map';

import {type YTErrorRaw} from '../../../@types/types';

import Icon from '../../components/Icon/Icon';
import Tabs from '../../components/Tabs/Tabs';
import {Yson} from '../../components/Yson/Yson';

import './ErrorDetails.scss';
import {unescapeSlashX} from '../../utils/utils';
import FormattedText from '../../components/formatters/FormattedText';
import {type UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';
import {ErrorToClipboardButton} from '../../containers/ErrorToClipboardButton/ErrorToClipboardButton';
import {getYsonSettingsErrorDetails} from '../../store/selectors/thor/unipika';
import {useSelector} from '../../store/redux-hooks';

const b = block('elements-error-details');

export type ErrorDetailsProps = {
    error: YTErrorRaw<{attributes?: object}> | AxiosError;
    maxCollapsedDepth?: number;
    defaultExpadedCount?: number;
};

type State = {
    showDetails: boolean;
    currentTab: 'attributes' | 'details' | 'stderrs';
};

export default function ErrorDetails({error, ...props}: ErrorDetailsProps) {
    const unipikaSettings = useSelector(getYsonSettingsErrorDetails);

    const normalizedError = React.useMemo(() => {
        if (typeof error === 'string') {
            return {message: error};
        }

        if (isAxiosError(error)) {
            return error;
        }

        const {
            message,
            code,
            inner_errors,
            attributes,
            yt_javascript_wrapper,
            ...unexpectedErrorFields
        } = error;

        const hasUnexpectedFields = Object.keys(unexpectedErrorFields).length > 0;
        let attrs = attributes;
        if (hasUnexpectedFields) {
            attrs = {unexpectedErrorFields};
            if (attributes !== undefined) {
                Object.assign(attrs, {attributes});
            }
        }

        return {
            message,
            code,
            inner_errors,
            yt_javascript_wrapper,
            ...(attrs ? {attributes: attrs} : {}),
        };
    }, [error]);

    return (
        <ErrorDetailsImpl
            {...props}
            error={normalizedError}
            originalError={error}
            unipikaSettings={unipikaSettings}
        />
    );
}

export function ErrorDetailsMessage({error}: {error: YTErrorRaw}) {
    const {message, code} = error;

    const value = ypath.getValue(message);
    let text = value;
    if ('string' === typeof text) {
        const msg = unescapeSlashX(text);
        text = <FormattedText text={msg} />;
    }
    return (
        <span className={b('message')}>
            {text ?? i18n('alert_unexpected-error-format')}
            {code !== undefined && <React.Fragment>[{ypath.getValue(code)}]</React.Fragment>}
        </span>
    );
}

type ErrorDetailsImplProps = ErrorDetailsProps & {originalError: ErrorDetailsProps['error']};

class ErrorDetailsImpl extends React.Component<
    ErrorDetailsImplProps & {unipikaSettings: UnipikaSettings},
    State
> {
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

    state: State = {
        showDetails: Boolean(this.props.defaultExpadedCount),
        currentTab: ErrorDetailsImpl.prepareDefaultTab(this.props),
    };

    get TABS() {
        return [
            {
                value: 'details' as const,
                text: i18n('title_tab-details'),
                show: false,
            },
            {
                value: 'stderrs' as const,
                text: i18n('title_tab-stderrs'),
                show: false,
            },
            {
                value: 'attributes' as const,
                text: i18n('title_tab-attributes'),
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
        const {originalError} = this.props;
        const {currentTab} = this.state;

        const items = this.prepareTabs();

        return (
            <div className={b('tabs')}>
                <Tabs onTabChange={this.changeCurrentTab} active={currentTab} items={items} />
                <ErrorToClipboardButton size="s" error={originalError} />
            </div>
        );
    }

    renderTabContent() {
        const {currentTab} = this.state;

        const {error, unipikaSettings} = this.props;
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
                    <Yson value={attributes} settings={unipikaSettings} />
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
        const {defaultExpadedCount = 0, maxCollapsedDepth = Infinity} = this.props;

        const {inner_errors: innerErrors = []} = this.props.error as YTErrorRaw;
        if (isAxiosError<YTErrorRaw>(this.props.error)) {
            const {response} = this.props.error;
            const innerError = response?.data;
            if (innerError) {
                innerErrors.push(innerError);
            }
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
                            <ErrorDetailsMessage error={this.props.error as YTErrorRaw} />
                        </Link>
                        <div className={'toggle-subject'}>
                            {showDetails && this.renderDetails()}
                        </div>
                    </Flex>
                ) : (
                    <ErrorDetailsMessage error={this.props.error as YTErrorRaw} />
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
