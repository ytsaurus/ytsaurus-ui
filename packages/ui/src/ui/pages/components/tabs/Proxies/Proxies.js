import {connect} from 'react-redux';

import {
    changeBannedFilter,
    changeHostFilter,
    changeRoleFilter,
    changeStateFilter,
} from '../../../../store/actions/components/proxies/proxies';
import {
    selectRoles,
    selectStates,
    selectVisibleProxies,
} from '../../../../store/selectors/components/proxies/proxies';
import {mergeScreen, splitScreen as splitScreenAction} from '../../../../store/actions/global';
import {showNodeMaintenance} from '../../../../store/actions/components/node-maintenance-modal';

import './Proxies.scss';

import {ProxiesBase} from './ProxiesBase';

const mapStateToProps = (state) => {
    const {components, global} = state;
    const {
        loading,
        loaded,
        error,
        errorData,
        proxies,
        hostFilter,
        stateFilter,
        bannedFilter,
        roleFilter,
    } = components.proxies.proxies;
    const {splitScreen} = global;

    const visibleProxies = selectVisibleProxies(state);
    const states = selectStates(state);
    const roles = selectRoles(state);
    const initialLoading = loading && !loaded;

    return {
        loading,
        loaded,
        error,
        errorData,

        showingItems: visibleProxies.length,
        totalItems: proxies.length,
        proxies: visibleProxies,
        splitScreen,
        states,
        roles,
        stateFilter,
        hostFilter,
        roleFilter,
        bannedFilter,
        initialLoading,
    };
};

const mapDispatchToProps = {
    changeBannedFilter,
    changeHostFilter,
    changeStateFilter,
    changeRoleFilter,
    splitScreenAction,
    mergeScreen,

    showNodeMaintenance,
};

const Proxies = connect(mapStateToProps, mapDispatchToProps)(ProxiesBase);

export default Proxies;
