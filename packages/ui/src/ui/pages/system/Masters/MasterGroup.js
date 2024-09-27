import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import ReadOnlyIcon from '../../../assets/img/svg/read-only-icon.svg';
import WarmUpIcon from '../../../assets/img/svg/warmup-icon.svg';
import hammer from '../../../common/hammer';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {getMastersHostType} from '../../../store/selectors/settings';
import ypath from '../../../common/thor/ypath';
import Icon from '../../../components/Icon/Icon';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import NodeQuad from '../NodeQuad/NodeQuad';
import {SwitchLeaderButton} from './SwitchLeader';

import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import './MasterGroup.scss';
import {ChangeMaintenanceButton} from './ChangeMaintenanceButton';
import {calcShortNameByRegExp} from '../../../containers/Host/Host';

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
        state: PropTypes.oneOf(keys_(Instance.instanceStateToTheme)),
        address: PropTypes.string.isRequired,
        attributes: PropTypes.shape({
            warming_up: PropTypes.bool,
            read_only: PropTypes.bool,
            voting: PropTypes.bool,
        }),
        maintenance: PropTypes.bool,
        maintenanceMessage: PropTypes.string,
        allowVoting: PropTypes.bool,
        allowService: PropTypes.bool,
    };

    render() {
        const {
            state,
            address,
            attributes,
            maintenance,
            maintenanceMessage,
            allowVoting,
            allowService,
        } = this.props;
        const {voting} = attributes ?? {};
        // do not use `!voting` cause `voting === undefined` is the same as `voting === true`
        const denyVoting = allowVoting && voting === false;
        const theme =
            denyVoting && state === 'following'
                ? 'nonvoting'
                : Instance.instanceStateToTheme[state];
        const addressWithoutPort = hammer.format['Address'](address);

        /* eslint-disable camelcase */
        return (
            <Fragment>
                <div className={b('availability')}>
                    <NodeQuad theme={theme} />
                </div>
                <div className={b('role')}>
                    <span>{hammer.format['ReadableField'](state ? state : 'unknown')}</span>
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
                    <Tooltip content={addressWithoutPort}>
                        <div className={b('host-name')}>
                            {calcShortNameByRegExp(addressWithoutPort) || addressWithoutPort}
                        </div>
                    </Tooltip>
                    <Flex gap={1}>
                        <span className={b('host-btn')}>
                            <ClipboardButton view="flat-secondary" text={address} />
                        </span>
                        {allowService && (
                            <ChangeMaintenanceButton
                                className={b('host-btn')}
                                address={address}
                                maintenance={maintenance}
                                maintenanceMessage={maintenanceMessage}
                                type="master"
                            />
                        )}
                        {
                            <Text className={b('nonvoting', {show: denyVoting})} color="secondary">
                                [nonvoting]
                            </Text>
                        }
                    </Flex>
                </div>
            </Fragment>
        );
        /* eslint-enable camelcase */
    }
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
        allowService: PropTypes.bool,
    };

    renderQuorum() {
        const {quorum, cellTag, cellId, instances} = this.props;
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
        let leadingHost = '';
        const hosts = instances.map(({$address, state}) => {
            if (state === 'leading') {
                leadingHost = $address;
            }

            return $address;
        });

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
                        {cellId && (
                            <SwitchLeaderButton
                                cellId={cellId}
                                hosts={hosts}
                                leadingHost={leadingHost}
                            />
                        )}
                    </div>
                </div>
            </Fragment>
        );
    }

    render() {
        const {className, instances, hostType, gridRowStart, allowVoting, allowService} =
            this.props;

        return (
            <div className={b('group', {'grid-row-start': gridRowStart}, className)}>
                {this.renderQuorum()}
                {map_(
                    instances,
                    ({state, $address, $physicalAddress, $attributes, $rowAddress}) => {
                        const address = hostType === 'host' ? $address : $physicalAddress;
                        const maintenance = ypath.getValue($rowAddress, '/attributes/maintenance');
                        const maintenanceMessage = maintenance
                            ? ypath.getValue($rowAddress, '/attributes/maintenance_message') ||
                              'Maintenance'
                            : '';
                        return (
                            <Instance
                                key={$address}
                                address={address}
                                state={state}
                                attributes={$attributes}
                                maintenanceMessage={maintenanceMessage}
                                maintenance={maintenance}
                                allowVoting={allowVoting}
                                allowService={allowService}
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
