import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import map_ from 'lodash/map';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {loadSystemRPCProxies} from '../../../store/actions/system/rpc-proxies';
import {getCluster} from '../../../store/selectors/global';
import {setSettingsSystemRpcProxiesCollapsed} from '../../../store/actions/settings/settings';
import {getSettingsSystemRpcProxiesCollapsed} from '../../../store/selectors/settings-ts';
import {RootState} from '../../../store/reducers';
import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../Proxies/RoleGroup';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {useUpdater} from '../../../hooks/use-updater';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

type ReduxProps = ConnectedProps<typeof connector>;

class RpcProxies extends Component<ReduxProps> {
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
                <CollapsibleSectionStateLess
                    name={'RPC Proxies'}
                    overview={overview}
                    onToggle={this.onToggle}
                    collapsed={collapsed}
                    size={UI_COLLAPSIBLE_SIZE}
                >
                    <RoleGroupsContainer>
                        {map_(roleGroups, (data) => {
                            return (
                                <RoleGroup
                                    key={data.name}
                                    data={data}
                                    makeUrl={this.makeRoleGroupUrl}
                                    hideOthers
                                    bannedAsState
                                />
                            );
                        })}
                    </RoleGroupsContainer>
                </CollapsibleSectionStateLess>
            )
        );
    }

    render() {
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

function mapStateToProps(state: RootState) {
    const {roleGroups, counters} = state.system.rpcProxies;
    return {
        counters,
        roleGroups,
        collapsed: getSettingsSystemRpcProxiesCollapsed(state),
        cluster: getCluster(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemRpcProxiesCollapsed,
};

function RpcProxiesUpdater() {
    const dispatch = useThunkDispatch();

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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(RpcProxies);
