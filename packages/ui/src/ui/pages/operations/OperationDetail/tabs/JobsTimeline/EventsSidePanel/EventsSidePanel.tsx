import React, {FC, useCallback, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {
    getSelectedJob,
    selectActiveJob,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import Link from '../../../../../../components/Link/Link';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import {EventsTable} from './EventsTable';
import {getCluster} from '../../../../../../store/selectors/global';
import {getOperationId} from '../../../../../../store/selectors/operations/operation';
import './EventsSidePanel.scss';
import {MetaData} from '../EventsTimeline/MetaData';

const block = cn('yt-events-side-panel');

type Props = {
    onClose: () => void;
    onOutsideClick?: (e: MouseEvent) => void;
};

export const EventsSidePanel: FC<Props> = ({onClose, onOutsideClick}) => {
    const {id} = useSelector(selectActiveJob);
    const job = useSelector(getSelectedJob);
    const cluster = useSelector(getCluster);
    const operationId = useSelector(getOperationId);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleDocumentClick = useCallback(
        (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onOutsideClick?.(e);
            }
        },
        [onOutsideClick],
    );

    useEffect(() => {
        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [handleDocumentClick]);

    if (!id || !job) return null;

    return (
        <div ref={panelRef} className={block()}>
            <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" justifyContent="center" gap={1}>
                    <Text variant="subheader-3">
                        Job id:{' '}
                        <Link
                            theme="primary"
                            url={`/${cluster}/job/${operationId}/${id}`}
                            target="_blank"
                        >
                            {id}
                        </Link>
                    </Text>
                </Flex>
                <Button view="flat" onClick={onClose}>
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </Flex>
            <MetaData
                className={block('meta')}
                meta={{
                    startTime: job.start_time,
                    endTime: job.finish_time,
                    address: job.address,
                    allocationId: job.allocationId,
                }}
                showCopyButton
            />
            <div className={block('separator')} />
            <EventsTable events={job.events} />
        </div>
    );
};
