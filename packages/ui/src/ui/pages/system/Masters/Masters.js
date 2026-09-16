import {connect} from 'react-redux';
import {selectSettingsSystemMastersCollapsed} from '../../../store/selectors/settings/settings-ts';
import {setSettingsSystemMastersCollapsed} from '../../../store/actions/settings/settings';

import './Masters.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {MastersBase} from './MastersBase';

function mapStateToProps(state) {
    const {secondary, primary, providers, discovery, queueAgents, counters, initialized, alerts} =
        state.system.masters;
    return {
        initialized,
        secondary,
        primary,
        providers,
        discovery,
        queueAgents,
        counters,
        alerts,
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        collapsed: selectSettingsSystemMastersCollapsed(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemMastersCollapsed,
};

const Masters = connect(mapStateToProps, mapDispatchToProps)(MastersBase);

export default Masters;
