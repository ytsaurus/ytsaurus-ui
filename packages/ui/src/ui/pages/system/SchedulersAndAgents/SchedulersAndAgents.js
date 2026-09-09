import {connect} from 'react-redux';
import {
    selectSystemAgentsWithState,
    selectSystemSchedulerAndAgentAlerts,
    selectSystemSchedulerAndAgentCounters,
    selectSystemSchedulersWithState,
} from '../../../store/selectors/system/schedulers';

import './Schedulers.scss';
import {selectSettingsSystemSchedulersCollapsed} from '../../../store/selectors/settings/settings-ts';
import {setSettingsSystemSchedulersCollapsed} from '../../../store/actions/settings/settings';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {SchedulersAndAgentsBase} from './SchedulersAndAgentsBase';

function mapStateToProps(state) {
    return {
        schedulers: selectSystemSchedulersWithState(state),
        agents: selectSystemAgentsWithState(state),
        counters: selectSystemSchedulerAndAgentCounters(state),
        alerts: selectSystemSchedulerAndAgentAlerts(state),
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        collapsed: selectSettingsSystemSchedulersCollapsed(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemSchedulersCollapsed,
};

const SchedulersAndAgents = connect(mapStateToProps, mapDispatchToProps)(SchedulersAndAgentsBase);

export default SchedulersAndAgents;
