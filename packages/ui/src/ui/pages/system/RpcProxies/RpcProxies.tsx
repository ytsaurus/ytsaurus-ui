import {connect} from 'react-redux';
import {setSettingsSystemRpcProxiesCollapsed} from '../../../store/actions/settings/settings';
import {selectCluster} from '../../../store/selectors/global';
import {type RootState} from '../../../store/reducers';
import {selectSettingsSystemRpcProxiesCollapsed} from '../../../store/selectors/settings/settings-ts';

import {RpcProxiesBase} from './RpcProxiesBase';

function mapStateToProps(state: RootState) {
    const {roleGroups, counters} = state.system.rpcProxies;
    return {
        counters,
        roleGroups,
        collapsed: selectSettingsSystemRpcProxiesCollapsed(state),
        cluster: selectCluster(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemRpcProxiesCollapsed,
};

const RpcProxies = connect(mapStateToProps, mapDispatchToProps)(RpcProxiesBase);

export default RpcProxies;
