import React, {FC, useCallback} from 'react';
import hammer from '../../../common/hammer';
import NodeQuad, {NodeQuadTheme} from '../NodeQuad/NodeQuad';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import Icon from '../../../components/Icon/Icon';
import {useDispatch} from '../../../store/redux-hooks';
import ReadOnlyIcon from '../../../assets/img/svg/read-only-icon.svg';
import WarmUpIcon from '../../../assets/img/svg/warmup-icon.svg';
import {makeShortSystemAddress} from '../helpers/makeShortSystemAddress';
import {Flex, Text} from '@gravity-ui/uikit';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {ChangeMaintenanceButton} from './ChangeMaintenanceButton';
import block from 'bem-cn-lite';
import {MasterInstance} from '../../../store/selectors/system/masters';
import './MasterGroup.scss';
import {changeMasterMaintenance} from '../../../store/actions/system/masters';
import {CypressNode} from '../../../../shared/yt-types';

const b = block('master-group');

const instanceStateToTheme: Record<string, NodeQuadTheme> = {
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

type Props = {
    instance: MasterInstance;
    hostType: string;
    allowVoting?: boolean;
    allowService?: boolean;
};

export const Instance: FC<Props> = ({instance, hostType, allowVoting, allowService}) => {
    const dispatch = useDispatch();
    const {state, $address, $physicalAddress} = instance;
    const attributes = instance.$attributes as CypressNode<
        {read_only: boolean; voting: boolean; warming_up: boolean},
        unknown
    >['$attributes'];
    const address = hostType === 'host' ? $address : $physicalAddress;
    const maintenance = instance.getMaintenance();
    const maintenanceMessage = maintenance ? instance.getMaintenanceMessage() || 'Maintenance' : '';
    const {voting} = attributes ?? {};
    // do not use `!voting` cause `voting === undefined` is the same as `voting === true`
    const denyVoting = allowVoting && voting === false;
    const theme = denyVoting && state === 'following' ? 'nonvoting' : instanceStateToTheme[state!];
    const addressWithoutPort = hammer.format['Address'](address);

    const handleOnMaintenanceChange = useCallback(
        async (data: {path: string; maintenance: boolean; message: string}) => {
            await dispatch(changeMasterMaintenance(data));
        },
        [dispatch],
    );

    const shortName = makeShortSystemAddress(addressWithoutPort) || addressWithoutPort;

    return (
        <>
            <div className={b('availability')}>
                <NodeQuad theme={theme} />
            </div>
            <div className={b('role')}>
                <span>{hammer.format['ReadableField'](state ? state : 'unknown')}</span>
            </div>
            <div className={b('icon')}>
                {maintenanceMessage && (
                    <Tooltip content={<span>{maintenanceMessage}</span>}>
                        <Icon className={b('icon-maintenance')} awesome="digging" face="solid" />
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
                    <div className={b('host-name')}>{shortName}</div>
                </Tooltip>
                <Flex gap={1} alignItems="center">
                    <span className={b('host-btn')}>
                        <ClipboardButton view="flat-secondary" text={address} />
                    </span>
                    <ChangeMaintenanceButton
                        className={b('host-btn', {hidden: !allowService})}
                        path={instance.getPath()}
                        title={`Edit ${addressWithoutPort}`}
                        host={$physicalAddress}
                        container={$address}
                        maintenance={maintenance}
                        maintenanceMessage={maintenanceMessage}
                        onMaintenanceChange={handleOnMaintenanceChange}
                    />
                    <Text className={b('nonvoting', {hidden: !denyVoting})} color="secondary">
                        [nonvoting]
                    </Text>
                </Flex>
            </div>
        </>
    );
};
