import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Link from '../../components/Link/Link';
import block from 'bem-cn-lite';
import ypath from '../../common/thor/ypath';
import unipika from '../../common/thor/unipika';

import map_ from 'lodash/map';

import Icon from '../Icon/Icon';
import Tabs from '../../components/Tabs/Tabs';
import Yson from '../../components/Yson/Yson';

import './ErrorDetails.scss';
import {unescapeSlashX} from '../../utils/utils';
import FormattedText from '../formatters/FormattedText';
import {isYTError} from '../../../shared/utils';

const b = block('elements-error-details');

export default class ErrorDetails extends Component {
    static propTypes = {
        error: PropTypes.shape({
            attributes: PropTypes.object,
            message: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    $type: PropTypes.string.isRequired,
                    $value: PropTypes.string.isRequired,
                }),
            ]),
            inner_errors: PropTypes.array,
            code: PropTypes.number,
        }),
        settings: PropTypes.object,
        maxCollapsedDepth: PropTypes.number,
    };

    static prepareDefaultTab(props) {
        const {
            error: {attributes},
        } = props;
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

    state = {
        showDetails: false,
        currentTab: ErrorDetails.prepareDefaultTab(this.props),
    };

    get TABS() {
        return [
            {
                value: 'details',
                text: 'Details',
                show: false,
            },
            {
                value: 'stderrs',
                text: 'Stderrs',
                show: false,
            },
            {
                value: 'attributes',
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

    changeCurrentTab = (tabName) => {
        this.setState({
            currentTab: tabName,
        });
    };

    prepareTabs() {
        const {
            error: {attributes},
        } = this.props;

        return map_(this.TABS, (tab) => {
            if (typeof attributes[tab.value] !== 'undefined') {
                return Object.assign({}, tab, {show: true});
            } else {
                return Object.assign({}, tab);
            }
        });
    }

    renderTabs() {
        const {currentTab} = this.state;

        const items = this.prepareTabs();

        return (
            <div className={b('tabs')}>
                <Tabs
                    onTabChange={this.changeCurrentTab}
                    active={currentTab}
                    items={items}
                    underline
                />
            </div>
        );
    }

    renderTabContent() {
        const {currentTab} = this.state;

        const {
            error: {attributes},
            settings,
        } = this.props;
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
                {currentTab === 'details' && <pre className={codeClassName}>{details}</pre>}
                {currentTab === 'stderrs' && <pre className={codeClassName}>{stderrs}</pre>}
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
        const {
            error: {inner_errors: innerErrors = [], isAxiosError = false, response = {}},
            settings,
            maxCollapsedDepth = Infinity,
        } = this.props;

        if (!innerErrors.length && isAxiosError && response.data) {
            const innerError = isYTError(response.data)
                ? response.data
                : {attributes: response.data, message: 'Error'};
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
                            maxCollapsedDepth={
                                this.state.showDetails ? Infinity : maxCollapsedDepth - 1
                            }
                        />
                    ))}
                </div>
            )
        );
    }

    renderMessage() {
        const {
            error: {message, code},
        } = this.props;

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

    renderToggler() {
        const {showDetails} = this.state;

        return (
            <Icon
                className={b('error-toggler')}
                awesome={showDetails ? 'angle-up' : 'angle-down'}
            />
        );
    }

    renderError() {
        const {
            error: {attributes},
        } = this.props;
        const {showDetails} = this.state;

        return (
            <div className={b('error')}>
                {typeof attributes !== 'undefined' ? (
                    <div className={'toggle-group'}>
                        <Link theme="primary" onClick={this.toggleDetails}>
                            {this.renderToggler()}
                            {this.renderMessage()}
                        </Link>
                        <div className={'toggle-subject'}>
                            {showDetails && this.renderDetails()}
                        </div>
                    </div>
                ) : (
                    this.renderMessage()
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
