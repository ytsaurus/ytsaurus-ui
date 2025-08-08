import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';
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
                <>
                    <Text color="secondary">Allocation id:</Text> <span>{meta.allocationId}</span>
                </>
            )}
            {meta.incarnation && (
                <>
                    <Text color="secondary">Incarnation id:</Text> <span>{meta.incarnation}</span>
                </>
            )}
            <Text color="secondary">Address:</Text>{' '}
            <span>
                {hammer.format['Address'](meta.address)} &nbsp;
                {showCopyButton && (
                    <ClipboardButton view="flat-secondary" text={meta.address} size="s" />
                )}
            </span>
            <Text color="secondary">Start:</Text>{' '}
            <span>{hammer.format['DateTime'](meta.startTime)}</span>
            <Text color="secondary">End:</Text>{' '}
            <span>{meta.endTime ? hammer.format['DateTime'](meta.endTime) : '—'}</span>
            {duration && (
                <>
                    <Text color="secondary">Duration:</Text>{' '}
                    <span>{hammer.format['TimeDuration'](duration.asMilliseconds())}</span>
                </>
            )}
        </div>
    );
};
