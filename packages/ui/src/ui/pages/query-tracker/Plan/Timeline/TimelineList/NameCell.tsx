import React, {FC} from 'react';
import {NodeName} from '../../components/NodeName/NodeName';
import cn from 'bem-cn-lite';
import './NameCell.scss';
import {Text} from '@gravity-ui/uikit';
import {RowType} from '../utils';

const block = cn('yt-timeline-name-cell');

type Props = {
    row: RowType;
};

export const NameCell: FC<Props> = ({row}) => {
    const {isEvent, name, id, isExpanded} = row;

    if (isEvent) {
        return (
            <Text className={block()} ellipsis title={name} color="secondary">
                {name}
            </Text>
        );
    }
    return (
        <div
            key={id}
            className={block({
                expanded: isExpanded,
            })}
        >
            <NodeName row={row} className={block('node-name')} />
        </div>
    );
};
