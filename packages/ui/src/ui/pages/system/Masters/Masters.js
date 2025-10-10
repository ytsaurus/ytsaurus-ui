import React, {Component} from 'react';
import {connect} from 'react-redux';
import {useDispatch} from '../../../store/redux-hooks';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import map_ from 'lodash/map';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import VisibleHostTypeRadioButton from '../../../pages/system/VisibleHostTypeRadioButton';
import {sortStateProgress} from '../../../utils';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import MasterGroup from './MasterGroup';

import {loadMasters} from '../../../store/actions/system/masters';
import {getSettingsSystemMastersCollapsed} from '../../../store/selectors/settings/settings-ts';
import {setSettingsSystemMastersCollapsed} from '../../../store/actions/settings/settings';
import {useUpdater} from '../../../hooks/use-updater';

import './Masters.scss';
import {SystemAlert} from './SystemAlert';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';
import {StickyContainer} from '../../../components/StickyContainer/StickyContainer';

const b = block('system-master');
const headingCN = block('elements-heading')({size: 's'});

function computeStateProgress(counters) {
    const total = counters.total;

    return sortStateProgress(
        map_(counters.states, (count, state) => {
            return {
                value: total && (count / total) * 100,
                title: 'State: ' + state,
                theme:
                    {
                        quorum: 'success',
                        'weak-quorum': 'warning',
                        'no-quorum': 'danger',
                    }[state] || 'default',
            };
        }),
    );
}

class Masters extends Component {
    static propTypes = {
        // from connect
        alerts: PropTypes.arrayOf(PropTypes.object),
        counters: PropTypes.shape({
            flags: PropTypes.object,
            states: PropTypes.object,
        }).isRequired,
        initialized: PropTypes.bool.isRequired,
        primary: PropTypes.shape(MasterGroup.propTypes).isRequired,
        secondary: PropTypes.arrayOf(PropTypes.shape(MasterGroup.propTypes)),
        providers: PropTypes.shape(MasterGroup.propTypes).isRequired,
        discovery: PropTypes.shape(MasterGroup.propTypes).isRequired,
    };

    onToggle = () => {
        const {setSettingsSystemMastersCollapsed, collapsed: prevCollapsed} = this.props;
        setSettingsSystemMastersCollapsed(!prevCollapsed);
    };

    mastersFitIntoSection() {
        const {secondary, providers, discovery, queueAgents} = this.props;

        let groupsCount = 1; // for primary masters;
        groupsCount += secondary?.length || 0;
        groupsCount += providers?.instances?.length ? 1 : 0;
        groupsCount += discovery?.instances?.length ? 1 : 0;
        groupsCount += queueAgents?.instances?.length ? 1 : 0;

        return groupsCount <= 3;
    }

    renderMastersGroups = (masters, gridRowStart, {allowVoting} = {allowVoting: false}) =>
        map_(masters, (master) => (
            <MasterGroup
                key={master.cellTag}
                {...master}
                gridRowStart={gridRowStart}
                allowVoting={allowVoting}
                allowService
            />
        ));

    renderMasterTypeSwitcher() {
        return <VisibleHostTypeRadioButton className={b('container-host-radio')} />;
    }

    renderAlerts() {
        return <SystemAlert className={b('alerts')} />;
    }

    renderContent() {
        const {primary, secondary, providers, discovery, queueAgents} = this.props;

        const fitIntoSection = this.mastersFitIntoSection();

        const secondaryGroups = this.renderMastersGroups(secondary, fitIntoSection, {
            allowVoting: true,
        });

        return fitIntoSection ? (
            <div className={b('all-masters')}>
                <div className={headingCN}>Primary Masters</div>
                <MasterGroup
                    className={b('primary-master')}
                    {...primary}
                    allowVoting
                    allowService
                />
                {Boolean(secondary?.length) && (
                    <React.Fragment>
                        <div className={headingCN}>Secondary Masters</div>
                        {secondaryGroups}
                    </React.Fragment>
                )}
                {Boolean(providers?.instances?.length) && (
                    <React.Fragment>
                        <div className={headingCN}>Timestamp providers</div>
                        <MasterGroup
                            {...providers}
                            className={b('timestamp-providers')}
                            gridRowStart
                            allowVoting
                            allowService
                        />
                    </React.Fragment>
                )}
                {Boolean(discovery?.instances?.length) && (
                    <React.Fragment>
                        <div className={headingCN}>Discovery servers</div>
                        <MasterGroup
                            {...discovery}
                            className={b('discovery-servers')}
                            gridRowStart
                        />
                    </React.Fragment>
                )}
                {Boolean(queueAgents?.instances?.length) && (
                    <React.Fragment>
                        <div className={headingCN}>Queue agents</div>
                        <MasterGroup {...queueAgents} allowService />
                    </React.Fragment>
                )}
            </div>
        ) : (
            <div>
                <div className={headingCN}>Primary Masters</div>
                <MasterGroup
                    className={b('primary-master')}
                    {...primary}
                    allowVoting
                    allowService
                />
                {Boolean(secondary?.length) && (
                    <React.Fragment>
                        <div className={headingCN}>Secondary Masters</div>
                        <div className={b('secondary-masters')}>{secondaryGroups}</div>
                    </React.Fragment>
                )}
                <div className={b('flex')}>
                    {Boolean(providers?.instances?.length) &&
                        this.renderSection('providers', 'Timestamp providers', providers, {
                            allowVoting: true,
                            allowService: true,
                        })}
                    {Boolean(discovery?.instances?.length) &&
                        this.renderSection('discovery', 'Discovery servers', discovery)}
                    {Boolean(queueAgents?.instances?.length) &&
                        this.renderSection('queueAgents', 'Queue agents', queueAgents, {
                            allowService: true,
                        })}
                </div>
            </div>
        );
    }

    renderSection(
        name,
        heading,
        data,
        {allowVoting, allowService} = {allowVoting: false, allowService: false},
    ) {
        return (
            <div className={b(name)}>
                <div className={headingCN}>{heading}</div>
                <div className={b(`${name}-hosts`)}>
                    <MasterGroup {...data} allowVoting={allowVoting} allowService={allowService} />
                </div>
            </div>
        );
    }

    renderOverview() {
        const {counters} = this.props;

        const stateOverview = counters && {
            value: 100,
            view: 'thin',
            stack: computeStateProgress(counters),
        };
        const stateThemeMappings = {
            unavailable: 'danger',
            recovery: 'warning',
            'no-quorum': 'danger',
            'weak-quorum': 'warning',
        };
        const counterGroups = [
            ['recovery', 'unavailable'],
            ['primary', 'secondary'],
            ['no-quorum', 'weak-quorum', 'quorum'],
        ];

        const labels = [];
        const alertsCount = this.props.alerts.length;
        if (alertsCount > 0) {
            labels.push({
                text: `${alertsCount} alert${alertsCount > 1 ? 's' : ''}`,
                theme: 'warning',
            });
        }

        return (
            <>
                {this.renderMasterTypeSwitcher()}
                <SystemStateOverview
                    tab="masters"
                    labels={labels}
                    counters={counters}
                    stateThemeMappings={stateThemeMappings}
                    stateOverview={stateOverview}
                    counterGroup={counterGroups}
                />
            </>
        );
    }

    renderImpl() {
        const {initialized, collapsibleSize, collapsed} = this.props;

        if (!initialized) {
            return null;
        }

        const content = this.renderContent();
        const overview = this.renderOverview();

        return (
            <StickyContainer>
                {({stickyTopClassName}) => (
                    <CollapsibleSectionStateLess
                        name={'Masters'}
                        className={b({open: !collapsed})}
                        headingClassName={b('heading', stickyTopClassName)}
                        overview={overview}
                        collapsed={collapsed}
                        onToggle={this.onToggle}
                        size={collapsibleSize}
                    >
                        <div className={b('content')}>
                            {this.renderAlerts()}
                            {content}
                        </div>
                    </CollapsibleSectionStateLess>
                )}
            </StickyContainer>
        );
    }

    render() {
        return (
            <React.Fragment>
                <MastersUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }
}

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
        collapsed: getSettingsSystemMastersCollapsed(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemMastersCollapsed,
};

function MastersUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadMasters()).then(({isRetryFutile} = {}) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(Masters);
