import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import {compose} from 'redux';
import map_ from 'lodash/map';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import withDataLoader from '../../../hocs/pages/withDataLoader';

import {cancelLoadRPCProxies, loadRPCProxies} from '../../../store/actions/system/rpc-proxies';
import {getUISizes} from '../../../store/selectors/global';
import {setSettingsSystemRpcProxiesCollapsed} from '../../../store/actions/settings/settings';
import {getSettingsSystemRpcProxiesCollapsed} from '../../../store/selectors/settings-ts';
import {RootState} from '../../../store/reducers';
import {RoleGroup} from '../Proxies/RoleGroup';

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

    render() {
        const {roleGroups, counters, collapsibleSize, collapsed} = this.props;
        const overview = this.renderOverview();

        return (
            counters.total > 0 && (
                <CollapsibleSectionStateLess
                    name={'RPC Proxies'}
                    overview={overview}
                    onToggle={this.onToggle}
                    collapsed={collapsed}
                    size={collapsibleSize}
                >
                    {map_(roleGroups, (data) => {
                        return (
                            <RoleGroup
                                data={data}
                                url={`components/rpc_proxies?role=${data.name}`}
                            />
                        );
                    })}
                </CollapsibleSectionStateLess>
            )
        );
    }
}

function mapStateToProps(state: RootState) {
    const {roleGroups, counters} = state.system.rpcProxies;
    return {
        counters,
        roleGroups,
        collapsibleSize: getUISizes(state).collapsibleSize,
        collapsed: getSettingsSystemRpcProxiesCollapsed(state),
    };
}

const mapDispatchToProps = {
    loadData: loadRPCProxies,
    cancelLoadData: cancelLoadRPCProxies,
    setSettingsSystemRpcProxiesCollapsed,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector, withDataLoader)(RpcProxies);
