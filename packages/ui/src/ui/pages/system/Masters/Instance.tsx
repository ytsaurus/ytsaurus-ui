import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../common/hammer';
import NodeQuad from '../NodeQuad/NodeQuad';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import Icon from '../../../components/Icon/Icon';
import ReadOnlyIcon from '../../../assets/img/svg/read-only-icon.svg';
import WarmUpIcon from '../../../assets/img/svg/warmup-icon.svg';
import {makeShortSystemAddress} from '../helpers/makeShortSystemAddress';
import {Flex, Text} from '@gravity-ui/uikit';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {ChangeMaintenanceButton} from './ChangeMaintenanceButton';
import block from 'bem-cn-lite';
import {MasterInstance} from '../../../store/selectors/system/masters';
import ypath from '../../../common/thor/ypath';
import './MasterGroup.scss';

const b = block('master-group');

export class Instance extends Component {
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
        instance: MasterInstance,
        hostType: PropTypes.string.isRequired,
        allowVoting: PropTypes.bool,
        allowService: PropTypes.bool,
    };

    render() {
        const {instance, hostType, allowVoting, allowService} = this.props;
        const {state, $address, $physicalAddress, $attributes, $rowAddress} = instance;
        const address = hostType === 'host' ? $address : $physicalAddress;
        const maintenance = ypath.getValue($rowAddress, '/attributes/maintenance');
        const maintenanceMessage = maintenance
            ? ypath.getValue($rowAddress, '/attributes/maintenance_message') || 'Maintenance'
            : '';
        const {voting} = $attributes ?? {};
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
                    {$attributes?.read_only && (
                        <span className={b('icon-glyph')} title="Read only">
                            <ReadOnlyIcon width={14} height={14} />
                        </span>
                    )}
                    {$attributes?.warming_up && (
                        <span className={b('icon-glyph')} title="Warming up">
                            <WarmUpIcon width={14} height={14} />
                        </span>
                    )}
                </div>
                <div className={b('host')}>
                    <Tooltip content={addressWithoutPort}>
                        <div className={b('host-name')}>
                            {makeShortSystemAddress(addressWithoutPort) || addressWithoutPort}
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
