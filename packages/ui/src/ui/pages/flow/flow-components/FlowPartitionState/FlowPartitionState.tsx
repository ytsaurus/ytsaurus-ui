import {
    CircleArrowRight,
    CircleCheck,
    CirclePlay,
    CircleQuestion,
    CircleXmark,
} from '@gravity-ui/icons';
import {Flex} from '@gravity-ui/uikit';
import React from 'react';
import {FlowComputationPartitionType} from '../../../../../shared/yt-types';
import {YTText} from '../../../../components/Text/Text';
import './FlowPartitionState.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-flow-partition-state');

const STATE_ICON = {
    completed: {icon: <CircleCheck />, color: 'success'},
    executing: {icon: <CirclePlay />, color: 'info'},
    transient: {icon: <CircleArrowRight />, color: 'secondary'},
    interrupted: {icon: <CircleXmark />, color: 'danger'},
} as const;

export function FlowPartitionState({state}: Pick<FlowComputationPartitionType, 'state'>) {
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
