import React from 'react';
import {connect} from 'react-redux';
import block from 'bem-cn-lite';
import qs from 'qs';
import map_ from 'lodash/map';

import Link from '../../../containers/Link/Link';

import {selectCluster} from '../../../store/selectors/global';
import {type RootState} from '../../../store/reducers';

import {formatCounterName} from '../../../utils/index';

import i18n from './i18n';

import './SystemCounters.scss';

const b = block('system');

export type SystemCountersProps<Flags extends string> = {
    cluster?: string;
    tab?: string;

    counters?: {
        states?: Partial<Record<string, number | undefined>>;
        flags?: Partial<Record<Flags, number | undefined>>;
        total?: number;
        titles?: Record<string, string>;
    };
    stateThemeMappings?: Partial<Record<string, SystemCounterTheme>>;
    renderLinks?: boolean;

    makeUrl?: (
        params: Partial<Omit<Record<Flags, 'enabled'>, 'state'>> | {state?: string},
    ) => string | undefined;
};

export type SystemCounterTheme = 'warning' | 'danger' | undefined;

const COUNTER_TITLES = {
    get total() {
        return i18n('title_total');
    },
    get online() {
        return i18n('title_online');
    },
    get offline() {
        return i18n('title_offline');
    },
    get banned() {
        return i18n('title_banned');
    },
};

class SystemCounters<Flags extends string> extends React.Component<SystemCountersProps<Flags>> {
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
        name,
        params,
        value,
        theme,
    }: {
        name: string;
        params: Record<string, string>;
        value?: number;
        theme?: SystemCounterTheme;
    }) {
        if (isNaN(value!)) {
            return null;
        }

        const {renderLinks, counters} = this.props;
        const titles = Object.assign({}, COUNTER_TITLES, counters?.titles);
        const caption = titles?.[name] ?? formatCounterName(name);

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

        return map_(counters?.flags, (flag, key) => {
            if (!flag) {
                return null;
            }

            const flagName = key as Flags;

            return (
                <li key={flagName} className={'counter_flag'}>
                    {this.renderCounter({
                        name: flagName,
                        params: {[flagName]: 'enabled'},
                        theme: stateThemeMappings?.[flagName],
                        value: flag,
                    })}
                </li>
            );
        });
    }

    renderCountersStates() {
        const {counters, stateThemeMappings} = this.props;

        return map_(counters?.states, (state, stateName) => {
            return (
                <li key={stateName} className={'counter_state'}>
                    {this.renderCounter({
                        name: stateName,
                        params: {state: stateName},
                        theme: stateThemeMappings?.[stateName],
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
                    name: 'total',
                    params: {},
                    value: counters?.total,
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
        cluster: selectCluster(state),
    };
};

export default connect(mapStateToProps)(SystemCounters);
