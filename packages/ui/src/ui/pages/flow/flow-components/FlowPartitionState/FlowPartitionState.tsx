import {
    ArrowsRotateLeft,
    CircleArrowRight,
    CircleCheck,
    CirclePlay,
    CircleQuestion,
    CircleStop,
    CircleXmark,
} from '@gravity-ui/icons';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {FlowPartitionJobStateType, FlowPartitionStateType} from '../../../../../shared/yt-types';
import {YTText} from '../../../../components/Text/Text';
import './FlowPartitionState.scss';

const block = cn('yt-flow-partition-state');

const STATE_ICON = {
    // FlowPartitionStateType
    completed: {icon: <CircleCheck />, color: 'success'},
    executing: {icon: <CirclePlay />, color: 'info'},
    transient: {icon: <CircleArrowRight />, color: 'secondary'},
    interrupted: {icon: <CircleXmark />, color: 'danger'},
    // FlowPartitionJobStateType
    working: {icon: <CirclePlay />, color: 'info'},
    recovering: {icon: <ArrowsRotateLeft />, color: 'secondary'},
    unknown: {icon: <CircleQuestion />, color: 'secondary'},
    stopped: {icon: <CircleStop />, color: 'secondary'},
} as const;

export function FlowPartitionState({
    state,
}: {
    state: FlowPartitionStateType | FlowPartitionJobStateType;
}) {
    const {icon, color} = STATE_ICON[state] ?? {
        icon: <CircleQuestion />,
        color: 'warning' as const,
    };

    return (
        <Flex alignItems="center" gap={1}>
            <YTText color={color}>
                <div className={block('icon')}>{icon}</div>
            </YTText>
            <YTText className={block('text')}>{state}</YTText>
        </Flex>
    );
}
