import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';
import qs from 'qs';

import Link from '../../../components/Link/Link';

import {getCluster} from '../../../store/selectors/global';
import {RootState} from '../../../store/reducers';

import {formatCounterName} from '../../../utils/index';

import './SystemCounters.scss';

const b = block('system');

export type SystemCountersProps<States extends string, Flags extends string> = {
    tab: string;
    counters: {states: Record<States, number>; flags: Record<Flags, number>; total: number};
    stateThemeMappings: Record<States | Flags, SystemCounterTheme>;
    renderLinks?: boolean;

    makeUrl?: (params: Record<Flags, 'enabled'> | Record<States, string>) => string;
} & ReduxProps;

export type SystemCounterTheme = 'warning' | 'danger' | undefined;

type ReduxProps = ConnectedProps<typeof connector>;

class SystemCounters<States extends string, Flags extends string> extends React.Component<
    SystemCountersProps<States, Flags>
> {
    static propTypes = {
        renderLinks: PropTypes.bool,

        makeUrl: PropTypes.func,
    };

    static defaultProps = {
        stateThemeMappings: {},
        renderLinks: true,
    };

    prepareUrl(params: Record<string, string>) {
        const {makeUrl, cluster, tab} = this.props;
        const isEmptyParams = Object.keys(params).length === 0;

        if (makeUrl) {
            return makeUrl(params);
        }

        return `/${cluster}/components/${tab}` + (isEmptyParams ? '' : `?${qs.stringify(params)}`);
    }

    renderCounter({
        caption,
        params,
        value,
        theme,
    }: {
        caption: string;
        params: Record<string, string>;
        value: number;
        theme?: SystemCounterTheme;
    }) {
        const {renderLinks} = this.props;

        const url = renderLinks ? this.prepareUrl(params) : undefined;

        const content = (
            <>
                {caption}&nbsp;&nbsp;
                <strong>{value}</strong>
            </>
        );

        return url ? (
            <Link theme="primary" className={b('counter', {theme})} url={url}>
                {content}
            </Link>
        ) : (
            <span className={b('counter', {theme})}>{content}</span>
        );
    }

    renderCountersFlags() {
        const {counters, stateThemeMappings} = this.props;

        return _.map(counters.flags, (flag, key) => {
            if (!flag) {
                return null;
            }

            const flagName = key as Flags;

            return (
                <li key={flagName} className={'counter_flag'}>
                    {this.renderCounter({
                        caption: formatCounterName(flagName),
                        params: {flagName: 'enabled'},
                        theme: stateThemeMappings[flagName],
                        value: flag,
                    })}
                </li>
            );
        });
    }

    renderCountersStates() {
        const {counters, stateThemeMappings} = this.props;

        return _.map(counters.states, (state, key) => {
            const stateName = key as States;
            return (
                <li key={stateName} className={'counter_state'}>
                    {this.renderCounter({
                        caption: formatCounterName(stateName),
                        params: {state: stateName},
                        theme: stateThemeMappings[stateName],
                        value: state,
                    })}
                </li>
            );
        });
    }

    renderCounterTotal() {
        const {counters} = this.props;

        return (
            <li key={'total'} className={'counter_total'}>
                {this.renderCounter({
                    caption: formatCounterName('total'),
                    params: {},
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

const mapStateToProps = (state: RootState) => {
    return {
        cluster: getCluster(state),
    };
};

const connector = connect(mapStateToProps);

export default connector(SystemCounters);
