import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch} from 'react-redux';
import _ from 'lodash';
import block from 'bem-cn-lite';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import VisibleHostTypeRadioButton from '../../../pages/system/VisibleHostTypeRadioButton';
import {
    getSystemAgentsWithState,
    getSystemSchedulerAndAgentAlerts,
    getSystemSchedulerAndAgentCounters,
    getSystemSchedulersWithState,
} from '../../../store/selectors/system/schedulers';
import Scheduler from './Scheduler/Scheduler';
import Alert from '../../../components/Alert/Alert';

import {loadSchedulersAndAgents} from '../../../store/actions/system';

import prepareTags from './prepareTags';

import './Schedulers.scss';
import {getUISizes} from '../../../store/selectors/global';
import {getSettingsSystemSchedulersCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemSchedulersCollapsed} from '../../../store/actions/settings/settings';
import {useUpdater} from '../../../hooks/use-updater';

const b = block('system');
const headingCN = block('elements-heading')({size: 's'});

const connectedHost = PropTypes.shape({
    host: PropTypes.string,
    connected: PropTypes.bool,
});

class SchedulersAndAgents extends Component {
    static propTypes = {
        // from connect
        schedulers: PropTypes.arrayOf(connectedHost),
        agents: PropTypes.arrayOf(connectedHost),
        counters: PropTypes.shape({
            schedulers: PropTypes.object,
            agents: PropTypes.object,
        }),
        alerts: PropTypes.shape({
            schedulers: PropTypes.arrayOf(PropTypes.object),
            agents: PropTypes.arrayOf(PropTypes.object),
        }),
    };

    static defaultProps = {
        schedulers: [],
        agents: [],
        alerts: {
            schedulers: [],
            agents: [],
        },
    };

    renderHosts(connectedHosts) {
        return _.map(connectedHosts, ({host, state, maintenanceMessage}, index) => {
            return (
                <Scheduler
                    key={host ?? index}
                    host={host}
                    state={state}
                    maintenanceMessage={maintenanceMessage}
                />
            );
        });
    }

    renderSection(name, heading, showHostTypeButton) {
        const objects = this.props[name];
        const rows = Math.min(7, objects.length);
        const columns = Math.ceil(objects.length / rows);
        const style = {
            gridTemplateRows: `repeat(${rows}, 20px`,
            justifyContent: columns > 2 ? 'space-between' : 'start',
        };
        const containerStyle = {
            marginRight: name === 'schedulers' && columns === 1 ? '100px' : null,
            width: columns > 1 ? '100%' : 'auto',
        };

        return (
            <div className={b(name)} style={containerStyle}>
                <div className={headingCN}>
                    {heading}
                    {showHostTypeButton && (
                        <VisibleHostTypeRadioButton className={b('container-host-radio')} />
                    )}
                </div>
                <div className={b(`${name}-hosts`)} style={style}>
                    {this.renderHosts(objects)}
                </div>
            </div>
        );
    }

    renderOverview() {
        const {counters, alerts} = this.props;
        const tags = prepareTags(counters, alerts);

        return (
            <div className={b('heading-overview')}>
                {_.map(tags, ({theme, label}) => (
                    <span key={label} className={block('elements-label')({theme})}>
                        {label}
                    </span>
                ))}
            </div>
        );
    }

    onToggle = () => {
        const {collapsed, setSettingsSystemSchedulersCollapsed} = this.props;
        setSettingsSystemSchedulersCollapsed(!collapsed);
    };

    renderImpl() {
        const {schedulers, agents, alerts, collapsibleSize, collapsed} = this.props;

        if (!schedulers.length && !agents.length) {
            return null;
        }

        return (
            <CollapsibleSectionStateLess
                name="Schedulers and controller agents"
                overview={this.renderOverview()}
                collapsed={collapsed}
                onToggle={this.onToggle}
                size={collapsibleSize}
            >
                {_.map(alerts.schedulers, (alert) => (
                    <Alert key={alert.attributes.host} error={alert} />
                ))}
                {_.map(alerts.agents, (alert, index) => (
                    <Alert key={index} error={alert} />
                ))}

                <div className={b('schedulers-agents')}>
                    {schedulers.length > 0 && this.renderSection('schedulers', 'Schedulers', true)}
                    {agents.length > 0 &&
                        this.renderSection('agents', 'Controller agents', schedulers.length === 0)}
                </div>
            </CollapsibleSectionStateLess>
        );
    }

    render() {
        return (
            <React.Fragment>
                <SchedulersAndAgentsUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        schedulers: getSystemSchedulersWithState(state),
        agents: getSystemAgentsWithState(state),
        counters: getSystemSchedulerAndAgentCounters(state),
        alerts: getSystemSchedulerAndAgentAlerts(state),
        collapsibleSize: getUISizes().collapsibleSize,
        collapsed: getSettingsSystemSchedulersCollapsed(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemSchedulersCollapsed,
};

function SchedulersAndAgentsUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadSchedulersAndAgents()).then(({isRetryFutile} = {}) => {
                    if (isRetryFutile) {
                        allowUpdate = false;
                    }
                });
            }
        };
    }, [dispatch]);

    useUpdater(updateFn);

    return null;
}

export default connect(mapStateToProps, mapDispatchToProps)(SchedulersAndAgents);
