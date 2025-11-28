import React, {FC} from 'react';
import {Flex, Select, TextInput} from '@gravity-ui/uikit';
import {NodeState} from '../models/plan';
import './TimelineHeader.scss';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../store/redux-hooks';
import {getOperationNodesStates} from '../../../../store/selectors/query-tracker/queryPlan';

const block = cn('yt-timeline-header');

type Props = {
    onFilterChange: (filter: string) => void;
    onStatusChange: (status: NodeState | undefined) => void;
};

export const TimelineHeader: FC<Props> = ({onStatusChange, onFilterChange}) => {
    const states = useSelector(getOperationNodesStates);

    const handleStatusChange = (value: string[]) => {
        onStatusChange(value[0] as NodeState | undefined);
    };

    return (
        <Flex className={block()} gap={3}>
            <TextInput
                className={block('item')}
                placeholder="Filter by name"
                onUpdate={onFilterChange}
                hasClear
            />
            <Select<NodeState>
                className={block('item')}
                placeholder="Select status"
                onUpdate={handleStatusChange}
                hasClear
                multiple={false}
                label="Status"
                value={[]}
                options={states.map(({state, title, count}) => ({
                    value: state,
                    content: `${title}${count > 0 ? ` (${count})` : ''}`,
                }))}
                width={230}
            />
        </Flex>
    );
};
