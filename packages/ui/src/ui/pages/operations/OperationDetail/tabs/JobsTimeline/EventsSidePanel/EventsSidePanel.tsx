import React, {FC, useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    getSelectedJob,
    selectActiveJob,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {setSelectedJob} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {Flex, Text} from '@gravity-ui/uikit';
import Link from '../../../../../../components/Link/Link';
import cn from 'bem-cn-lite';
import {EventsTable} from './EventsTable';
import {getCluster} from '../../../../../../store/selectors/global';
import {getOperationId} from '../../../../../../store/selectors/operations/operation';
import './EventsSidePanel.scss';
import {MetaData} from '../EventsTimeline/MetaData';
import {SidePanelEmpty} from './SidePanelEmpty';

const block = cn('yt-events-side-panel');

export const EventsSidePanel: FC = () => {
    const dispatch = useDispatch();
    const containerRef = useRef<HTMLDivElement>(null);
    const id = useSelector(selectActiveJob);
    const job = useSelector(getSelectedJob);
    const cluster = useSelector(getCluster);
    const operationId = useSelector(getOperationId);

    const handleOutsideClick = useCallback(
        (event: MouseEvent) => {
            if (
                id &&
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                // exclude timeline & gutter click
                const target = event.target as Element;
                const timelineElement = target.closest('.yt-operation-timeline');
                const gutterElement = target.closest('.gutter');
                const headerControls = target.closest('.yt-timeline-header');

                if (!timelineElement && !gutterElement && !headerControls) {
                    dispatch(setSelectedJob(''));
                }
            }
        },
        [dispatch, id],
    );

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    if (!id || !job) return <SidePanelEmpty />;

    return (
        <div ref={containerRef} className={block()}>
            <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" justifyContent="center" gap={1}>
                    <Text variant="subheader-3">
                        Job id{' '}
                        <Link
                            theme="primary"
                            url={`/${cluster}/job/${operationId}/${id}`}
                            target="_blank"
                        >
                            {id}
                        </Link>
                    </Text>
                </Flex>
            </Flex>
            <MetaData
                className={block('meta')}
                meta={{
                    startTime: job.start_time,
                    endTime: job.finish_time,
                    address: job.address,
                    allocationId: job.allocationId,
                    incarnation: job.incarnation,
                }}
                showCopyButton
            />
            <div className={block('separator')} />
            <EventsTable events={job.events} />
        </div>
    );
};
