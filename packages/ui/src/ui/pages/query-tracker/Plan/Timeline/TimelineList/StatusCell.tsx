import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {operationsStateConfig} from '../../utils';
import cn from 'bem-cn-lite';
import './StatusCell.scss';
import {NodeStatusIcon} from './NodeStatusIcon';
import {RowType} from '../utils';

const block = cn('yt-timeline-status-cell');

type Props = {
    row: RowType;
};

export const StatusCell: FC<Props> = ({row: {isEvent, node}}) => {
    if (isEvent) return null;

    const state = node.progress?.state ?? 'NotStarted';
    const {completed = 0, total} = node.progress ?? {};
    const completePercent = Math.floor((completed / (total || 1)) * 100);

    return (
        <span className={block()}>
            <Text color="secondary">
                {node.type === 'in' || node.type === 'out' ? (
                    '-'
                ) : (
                    <Flex alignItems="center" gap={1}>
                        <NodeStatusIcon
                            className={block('icon', {state: state.toLowerCase()})}
                            state={state}
                            progress={node.progress}
                        />
                        <span>
                            {state === 'InProgress'
                                ? `${operationsStateConfig[state].title}: ${completePercent}%`
                                : operationsStateConfig[state].title}
                        </span>
                    </Flex>
                )}
            </Text>
        </span>
    );
};
