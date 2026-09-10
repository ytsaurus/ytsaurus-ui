import React, {Component} from 'react';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import i18n from './i18n';

import {useUpdater} from '../../../hooks/use-updater';
import {loadSystemRPCProxies} from '../../../store/actions/system/rpc-proxies';
import {useDispatch} from '../../../store/redux-hooks';
import {type MakeUrlParams} from '../ProxiesImpl/RoleGroup';
import {ProxiesImpl} from '../ProxiesImpl/ProxiesImpl';
import {type RoleGroupInfo, type SystemNodeCounters} from '../../../store/reducers/system/proxies';

type ReduxProps = {
    counters: SystemNodeCounters;
    roleGroups: RoleGroupInfo[];
    collapsed: boolean;
    cluster: string;
    setSettingsSystemRpcProxiesCollapsed: (value: boolean) => void;
};

export class RpcProxiesBase extends Component<ReduxProps> {
    onToggle = () => {
        const {collapsed, setSettingsSystemRpcProxiesCollapsed} = this.props;
        setSettingsSystemRpcProxiesCollapsed(!collapsed);
    };

    renderOverview() {
        const {counters} = this.props;

        return <SystemStateOverview tab="rpc_proxies" counters={counters} />;
    }

    renderImpl() {
        const {roleGroups, counters, collapsed} = this.props;
        const overview = this.renderOverview();

        return (
            counters.total > 0 && (
                <ProxiesImpl
                    name={i18n('title_rpc-proxies')}
                    overview={overview}
                    onToggleCollapsed={this.onToggle}
                    roleGroups={roleGroups}
                    collapsed={collapsed}
                    makeUrl={this.makeRoleGroupUrl}
                />
            )
        );
    }

    override render() {
        return (
            <React.Fragment>
                <RpcProxiesUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }

    makeRoleGroupUrl = ({name, state}: MakeUrlParams = {}) => {
        const {cluster} = this.props;
        const params = new URLSearchParams({role: name!});
        if (state === 'banned') {
            params.append('banned', 'true');
        } else if (state) {
            params.append('state', state);
        }
        return `/${cluster}/components/rpc_proxies?${params}`;
    };
}

function RpcProxiesUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadSystemRPCProxies()).then((data) => {
                    if (data?.isRetryFutile) {
                        allowUpdate = false;
                    }
                });
            }
        };
    }, [dispatch]);

    useUpdater(updateFn);

    return null;
}
