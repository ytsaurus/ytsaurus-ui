import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch} from 'react-redux';

import map_ from 'lodash/map';

import block from 'bem-cn-lite';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import {StickyContainer} from '../../../components/StickyContainer/StickyContainer';
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
import {getSettingsSystemSchedulersCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemSchedulersCollapsed} from '../../../store/actions/settings/settings';
import {useUpdater} from '../../../hooks/use-updater';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

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

    renderHosts(name, connectedHosts) {
        return map_(
            connectedHosts,
            ({host, physicalHost, address, state, maintenanceMessage}, index) => {
                return (
                    <Scheduler
                        key={host ?? index}
                        host={host}
                        physicalHost={physicalHost}
                        address={address}
                        state={state}
                        maintenanceMessage={maintenanceMessage}
                        type={name}
                    />
                );
            },
        );
    }

    renderSection(name, heading) {
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
                <div className={headingCN}>{heading}</div>
                <div className={b(`${name}-hosts`)} style={style}>
                    {this.renderHosts(name, objects)}
                </div>
            </div>
        );
    }

    renderOverview() {
        const {counters, alerts} = this.props;
        const tags = prepareTags(counters, alerts);

        return (
            <>
                <VisibleHostTypeRadioButton className={b('container-host-radio')} />
                <div className={b('heading-overview')}>
                    {map_(tags, ({theme, label}) => (
                        <span key={label} className={block('elements-label')({theme})}>
                            {label}
                        </span>
                    ))}
                </div>
            </>
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
            <StickyContainer>
                {({topStickyClassName}) => (
                    <CollapsibleSectionStateLess
                        name="Schedulers and controller agents"
                        headingClassName={topStickyClassName}
                        overview={this.renderOverview()}
                        collapsed={collapsed}
                        onToggle={this.onToggle}
                        size={collapsibleSize}
                    >
                        {map_(alerts.schedulers, (alert) => (
                            <Alert key={alert.attributes.host} error={alert} />
                        ))}
                        {map_(alerts.agents, (alert, index) => (
                            <Alert key={index} error={alert} />
                        ))}

                        <div className={b('schedulers-agents')}>
                            {schedulers.length > 0 &&
                                this.renderSection('schedulers', 'Schedulers')}
                            {agents.length > 0 && this.renderSection('agents', 'Controller agents')}
                        </div>
                    </CollapsibleSectionStateLess>
                )}
            </StickyContainer>
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
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
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
