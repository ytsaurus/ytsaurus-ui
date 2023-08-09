import React, {Component} from 'react';
import {connect} from 'react-redux';
import block from 'bem-cn-lite';
import {compose} from 'redux';
import _ from 'lodash';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import withDataLoader from '../../../hocs/pages/withDataLoader';
import Link from '../../../components/Link/Link';
import NodeQuad from '../NodeQuad/NodeQuad';

import {cancelLoadRPCProxies, loadRPCProxies} from '../../../store/actions/system/rpc-proxies';
import {formatCounterName} from '../../../utils/index';
import {getUISizes} from '../../../store/selectors/global';
import {setSettingsSystemRpcProxiesCollapsed} from '../../../store/actions/settings/settings';
import {getSettingsSystemRpcProxiesCollapsed} from '../../../store/selectors/settings-ts';

const b = block('system');

class RpcProxies extends Component {
    onToggle = () => {
        const {collapsed, setSettingsSystemRpcProxiesCollapsed} = this.props;
        setSettingsSystemRpcProxiesCollapsed(!collapsed);
    };

    renderRoleGroup = (group) => {
        const nodes = _.map(group.items, (rpcProxy) => {
            const state = rpcProxy.effectiveState;
            return <NodeQuad key={rpcProxy.name} theme={state} />;
        });
        const nodesSize = Object.keys(this.props.roleGroups).length > 1 ? 'l' : 'xl';
        const url = `components/rpc_proxies?role=${group.name}`;

        return (
            <Link key={group.name} className={b('rack-wrapper')} url={url} routed>
                <span className={block('elements-heading ')({size: 's'})}>{group.name}</span>
                <div className={b('rack', {size: nodesSize})}>
                    <div className={b('rack-nodes')}>{nodes}</div>
                    <div className={b('rack-counters')}>
                        <div className={b('rack-counter', {secondary: 'yes'})}>
                            {formatCounterName('total')}
                            <span>{group.total}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
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
                    <div className={b('racks')}>{_.map(roleGroups, this.renderRoleGroup)}</div>
                </CollapsibleSectionStateLess>
            )
        );
    }
}

function mapStateToProps(state) {
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

export default compose(connect(mapStateToProps, mapDispatchToProps), withDataLoader)(RpcProxies);
