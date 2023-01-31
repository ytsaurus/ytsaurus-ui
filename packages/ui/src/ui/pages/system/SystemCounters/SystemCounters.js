import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';
import qs from 'qs';

import Link from '../../../components/Link/Link';

import {formatCounterName, getCounterAction} from '../../../utils/index';

import './SystemCounters.scss';
import {getCluster} from '../../../store/selectors/global';

const b = block('system');

class SystemCounters extends Component {
    static propTypes = {
        tab: PropTypes.string,
        counters: PropTypes.object,
        stateThemeMappings: PropTypes.objectOf(PropTypes.string),
        renderLinks: PropTypes.bool,

        // from hoc
        cluster: PropTypes.string.isRequired,
    };

    static defaultProps = {
        stateThemeMappings: {},
        renderLinks: true,
    };

    prepareUrl(state) {
        const {cluster, page = 'components', tab, ...params} = state;
        const isEmptyParams = Object.keys(params).length === 0;
        Object.keys(params).forEach((key) => {
            if (params[key] === true) {
                params[key] = 'enabled';
            }
        });

        return `/${cluster}/${page}/${tab}` + (isEmptyParams ? '' : `?${qs.stringify(params)}`);
    }

    renderCounter({caption, action, value, theme}) {
        const {cluster} = this.props;
        action = action ? {cluster, ...action} : action;

        const url = action ? this.prepareUrl(action) : undefined;
        const renderValue = () =>
            action ? (
                <Link theme="primary" url={url}>
                    {value}
                </Link>
            ) : (
                value
            );

        return (
            <span className={b('counter', {theme})}>
                {caption}&nbsp;&nbsp;
                <strong>{renderValue()}</strong>
            </span>
        );
    }

    renderCountersFlags() {
        const {counters, stateThemeMappings, renderLinks, tab} = this.props;

        return _.map(counters.flags, (flag, flagName) => {
            if (!flag) {
                return null;
            }

            return (
                <li key={flagName} className={'counter_flag'}>
                    {this.renderCounter({
                        caption: formatCounterName(flagName),
                        action: renderLinks && getCounterAction(tab, 'flags', flagName),
                        theme: stateThemeMappings[flagName],
                        value: flag,
                    })}
                </li>
            );
        });
    }

    renderCountersStates() {
        const {counters, stateThemeMappings, renderLinks, tab} = this.props;

        return _.map(counters.states, (state, stateName) => {
            return (
                <li key={stateName} className={'counter_state'}>
                    {this.renderCounter({
                        caption: formatCounterName(stateName),
                        action: renderLinks && getCounterAction(tab, 'state', stateName),
                        theme: stateThemeMappings[stateName],
                        value: state,
                    })}
                </li>
            );
        });
    }

    renderCounterTotal() {
        const {counters, tab, renderLinks} = this.props;

        return (
            <li key={'total'} className={'counter_total'}>
                {this.renderCounter({
                    caption: formatCounterName('total'),
                    action: renderLinks && getCounterAction(tab),
                    value: counters.total,
                })}
            </li>
        );
    }

    render() {
        const countersFlags = this.renderCountersFlags();
        const countersStates = this.renderCountersStates();
        const counterTotal = this.renderCounterTotal();

        return (
            <div className={b('heading-overview-counters')}>
                <ul className={block('elements-list')({type: 'unstyled'})}>
                    {countersFlags}
                    {countersStates}
                    {counterTotal}
                </ul>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        cluster: getCluster(state),
    };
};

export default connect(mapStateToProps)(SystemCounters);
