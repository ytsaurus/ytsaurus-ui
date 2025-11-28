import React, {FC} from 'react';
import {Flex, List, Text} from '@gravity-ui/uikit';
import {UseTimelineDataResult} from '../useTimelineData';
import {RowType} from '../utils';
import {StatusCell} from './StatusCell';
import {NameCell} from './NameCell';
import {ScaleButton} from './ScaleButton';
import cn from 'bem-cn-lite';
import './TimelineList.scss';
import {ExpandButton} from '../../../../../components/ExpandButton';

const block = cn('yt-timeline-list');

type Props = {
    timelineData: UseTimelineDataResult;
    rowHeight: number;
    onScale: (data: 'all' | {from: number; to: number}) => void;
    className?: string;
};

export const TimelineList: FC<Props> = ({rowHeight, timelineData, onScale, className}) => {
    const {tableItems, isSomeAxesCollapsed, handleExpandAll, handleExpandAxis} = timelineData;

    const renderItem = (row: RowType) => {
        const {node, from, to, isExpandable} = row;
        const {type, id} = node;

        const jobNode = type !== 'in' && type !== 'out';
        const showExpanded = jobNode && isExpandable && id !== undefined;

        return (
            <Flex
                className={block('row')}
                alignItems="center"
                justifyContent={row.isEvent ? 'flex-end' : 'space-between'}
                gap={1}
            >
                <StatusCell row={row} />
                <div className={block('right-columns')}>
                    <NameCell row={row} />
                    {jobNode && (
                        <ScaleButton
                            onClick={() => {
                                if (!from || !to) return;
                                onScale({from, to});
                            }}
                        />
                    )}
                    {showExpanded && (
                        <ExpandButton
                            size="xs"
                            expanded={Boolean(row.isExpanded)}
                            toggleExpanded={() => {
                                handleExpandAxis(id);
                            }}
                        />
                    )}
                </div>
            </Flex>
        );
    };

    return (
        <div className={block(null, className)}>
            <Flex
                className={block('header')}
                alignItems="center"
                justifyContent="space-between"
                gap={1}
            >
                <Text variant="subheader-1">Status</Text>
                <div className={block('right-columns', {header: true})}>
                    <ScaleButton
                        onClick={() => {
                            onScale('all');
                        }}
                    />
                    <ExpandButton
                        size="xs"
                        expanded={!isSomeAxesCollapsed}
                        toggleExpanded={handleExpandAll}
                    />
                </div>
            </Flex>
            <List
                className={block('list')}
                items={tableItems}
                itemHeight={rowHeight}
                filterable={false}
                sortable={false}
                renderItem={renderItem}
            />
        </div>
    );
};
