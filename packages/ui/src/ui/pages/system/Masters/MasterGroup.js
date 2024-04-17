import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import block from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';

import ReadOnlyIcon from '../../../../../img/svg/read-only-icon.svg';
import WarmUpIcon from '../../../../../img/svg/warmup-icon.svg';
import hammer from '../../../common/hammer';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {getMastersHostType} from '../../../store/selectors/settings';
import ypath from '../../../common/thor/ypath';
import Icon from '../../../components/Icon/Icon';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import NodeQuad from '../NodeQuad/NodeQuad';
import {SwitchLeaderButton} from './SwitchLeader';

import './MasterGroup.scss';

const b = block('master-group');

class Instance extends Component {
    static instanceStateToTheme = {
        active: 'online',
        connected: 'online',
        leading: 'online',
        disconnected: 'banned',
        following: 'following',
        follower_recovery: 'banned',
        leader_recovery: 'banned',
        standby: 'banned',
        elections: 'offline',
        stopped: 'offline',
        unknown: 'offline',
        online: 'online',
        offline: 'offline',
    };

    static propTypes = {
        state: PropTypes.oneOf(_.keys(Instance.instanceStateToTheme)),
        address: PropTypes.string.isRequired,
        currentLeaderAddress: PropTypes.string,
        cellId: PropTypes.string,
        attributes: PropTypes.shape({
            warming_up: PropTypes.bool,
            read_only: PropTypes.bool,
            voting: PropTypes.bool,
        }),
        maintenanceMessage: PropTypes.string,
        allowVoting: PropTypes.bool,
        allowSwitchLeader: PropTypes.bool,
    };

    render() {
        const {state, address, attributes, maintenanceMessage, allowVoting} = this.props;
        const {voting} = attributes ?? {};
        // do not use `!voting` cause `voting === undefined` is the same as `voting === true`
        const denyVoting = allowVoting && voting === false;
        const theme =
            denyVoting && state === 'following'
                ? 'nonvoting'
                : Instance.instanceStateToTheme[state];

        /* eslint-disable camelcase */
        return (
            <Fragment>
                <div className={b('availability')}>
                    <NodeQuad theme={theme} />
                </div>
                <div className={b('role')}>
                    <span>{hammer.format['ReadableField'](state ? state : 'unknown')}</span>
                    {this.renderSwitchLeaderButton()}
                </div>
                <div className={b('icon')}>
                    {maintenanceMessage && (
                        <Tooltip content={<span>{maintenanceMessage}</span>}>
                            <Icon
                                className={b('icon-maintenance')}
                                awesome="digging"
                                face="solid"
                            />
                        </Tooltip>
                    )}
                    {attributes?.read_only && (
                        <span className={b('icon-glyph')} title="Read only">
                            <ReadOnlyIcon width={14} height={14} />
                        </span>
                    )}
                    {attributes?.warming_up && (
                        <span className={b('icon-glyph')} title="Warming up">
                            <WarmUpIcon width={14} height={14} />
                        </span>
                    )}
                </div>
                <div className={b('host')}>
                    <div className={b('host-name')}>{hammer.format['Address'](address)}</div>
                    <div>
                        <span className={b('host-copy-btn')}>
                            <ClipboardButton view="flat-secondary" text={address} />
                        </span>
                        {
                            <Text className={b('nonvoting', {show: denyVoting})} color="secondary">
                                [nonvoting]
                            </Text>
                        }
                    </div>
                </div>
            </Fragment>
        );
        /* eslint-enable camelcase */
    }

    renderSwitchLeaderButton = () => {
        const {address, currentLeaderAddress, cellId, allowSwitchLeader} = this.props;

        if (!allowSwitchLeader || address === currentLeaderAddress) {
            return null;
        }

        return (
            <SwitchLeaderButton
                className={b('switch-leader-button')}
                currentLeaderAddress={currentLeaderAddress}
                newLeaderAddress={address}
                cellId={cellId}
                address={address}
            />
        );
    };
}

class MasterGroup extends Component {
    static propTypes = {
        // from parent
        className: PropTypes.string,
        instances: PropTypes.arrayOf(
            PropTypes.shape({
                state: PropTypes.string,
                $address: PropTypes.string,
                $physicalAddress: PropTypes.string,
            }),
        ),
        cellTag: PropTypes.number,
        quorum: PropTypes.shape({
            status: PropTypes.string,
            leaderCommitedVersion: PropTypes.string,
        }),
        leader: PropTypes.shape({
            state: PropTypes.string,
            $address: PropTypes.string,
        }),
        // from connect
        hostType: PropTypes.oneOf(['host', 'physicalHost']),
        gridRowStart: PropTypes.bool,
        allowVoting: PropTypes.bool,
        allowSwitchLeader: PropTypes.bool,
    };

    renderQuorum() {
        const {quorum, cellTag} = this.props;
        const status = quorum ? quorum.status : 'unknown';
        const quorumTitle = quorum && `Leader committed version: ${quorum.leaderCommitedVersion}`;
        const cellTitle = `Cell tag: ${cellTag}`;
        const icons = {
            quorum: 'check-circle',
            'weak-quorum': 'exclamation-circle',
            'no-quorum': 'exclamation-circle',
            unknown: 'question-circle',
        };
        const states = {
            quorum: 'present',
            'weak-quorum': 'weak',
            'no-quorum': 'missing',
            unknown: 'unknown',
        };

        return (
            <Fragment>
                {quorum && (
                    <Fragment>
                        <div
                            className={b('quorum-status', {
                                state: states[status],
                            })}
                        >
                            <Icon face="solid" awesome={icons[status]} />
                        </div>
                        <div className={b('quorum-label')}>
                            {hammer.format['Readable'](status, {
                                delimiter: '-',
                            })}
                        </div>

                        <div className={b('icon')} title={quorumTitle}>
                            <Icon className={b('icon-glyph')} face="" awesome="code-branch" />
                        </div>
                    </Fragment>
                )}

                <div className={b('host', {quorum: true})}>
                    <div className={b('quorum-version')} title={quorumTitle}>
                        <span>{quorum && quorum.leaderCommitedVersion}</span>
                    </div>
                    <div className={b('quorum-cell')} title={cellTitle}>
                        {cellTag && <Icon className={b('icon-glyph')} face="solid" awesome="tag" />}
                        {hammer.format['Hex'](cellTag)}
                    </div>
                </div>
            </Fragment>
        );
    }

    render() {
        const {className, instances, hostType, gridRowStart, allowVoting, allowSwitchLeader} =
            this.props;

        const currentLeader =
            allowSwitchLeader && instances.find((item) => item.state === 'leading');

        return (
            <div className={b('group', {'grid-row-start': gridRowStart}, className)}>
                {this.renderQuorum()}
                {_.map(
                    instances,
                    ({state, $address, $physicalAddress, $attributes, $rowAddress}) => {
                        const address = hostType === 'host' ? $address : $physicalAddress;
                        const maintenance = ypath.getValue($rowAddress, '/attributes/maintenance');
                        const maintenanceMessage = maintenance
                            ? ypath.getValue($rowAddress, '/attributes/maintenance_message') ||
                              'Maintenance'
                            : '';
                        const cellId = $rowAddress.cellId;
                        return (
                            <Instance
                                key={$address}
                                currentLeaderAddress={currentLeader?.$address}
                                address={address}
                                cellId={cellId}
                                state={state}
                                attributes={$attributes}
                                maintenanceMessage={maintenanceMessage}
                                allowVoting={allowVoting}
                                allowSwitchLeader={allowSwitchLeader}
                            />
                        );
                    },
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const hostType = getMastersHostType(state);
    return {hostType};
};

export default connect(mapStateToProps)(MasterGroup);
