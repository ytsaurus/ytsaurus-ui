import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {JobLineEvent} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import cn from 'bem-cn-lite';
import './MetaData.scss';
import ClipboardButton from '../../../../../../components/ClipboardButton/ClipboardButton';
import hammer from '../../../../../../common/hammer';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.extend(duration);

const block = cn('yt-event-timeline-meta');

type Props = {
    meta: JobLineEvent['meta'];
    showCopyButton?: boolean;
    className?: string;
};

type ItemProps = {
    title: string;
    value: string;
    showCopy?: boolean;
};

const MetaItem: FC<ItemProps> = ({title, value, showCopy}) => {
    return (
        <>
            <Text color="secondary">{title}</Text>
            <Flex alignItems="flex-start" gap={1}>
                <span>{value}</span>
                {showCopy && (
                    <ClipboardButton
                        className={block('copy-button')}
                        view="flat-secondary"
                        text={value}
                        size="s"
                    />
                )}
            </Flex>
        </>
    );
};

export const MetaData: FC<Props> = ({meta, showCopyButton, className}) => {
    let duration;
    if (meta.endTime && meta.startTime) {
        const start = dayjs(meta.startTime);
        const end = dayjs(meta.endTime);
        const diff = end.diff(start);
        duration = dayjs.duration(diff);
    }

    return (
        <div className={block(null, className)}>
            {meta.allocationId && (
                <MetaItem
                    title="Allocation id"
                    value={meta.allocationId}
                    showCopy={showCopyButton}
                />
            )}
            {meta.incarnation && (
                <MetaItem
                    title="Incarnation id"
                    value={meta.incarnation}
                    showCopy={showCopyButton}
                />
            )}
            <MetaItem
                title="Address"
                value={hammer.format['Address'](meta.address)}
                showCopy={showCopyButton}
            />
            <MetaItem
                title="Start"
                value={hammer.format['DateTime'](meta.startTime)}
                showCopy={showCopyButton}
            />
            <MetaItem
                title="End"
                value={meta.endTime ? hammer.format['DateTime'](meta.endTime) : '—'}
                showCopy={showCopyButton}
            />
            {duration && (
                <MetaItem
                    title="Duration"
                    value={hammer.format['TimeDuration'](duration.asMilliseconds())}
                    showCopy={showCopyButton}
                />
            )}
        </div>
    );
};
