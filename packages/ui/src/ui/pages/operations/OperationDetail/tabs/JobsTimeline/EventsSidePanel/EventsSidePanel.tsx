import React, {type FC, useRef} from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';
import {
    selectActiveJob,
    selectSelectedJob,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {Button, Flex, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import Link from '../../../../../../containers/Link/Link';
import cn from 'bem-cn-lite';
import {EventsTable} from './EventsTable';
import {selectCluster} from '../../../../../../store/selectors/global';
import {selectOperationId} from '../../../../../../store/selectors/operations/operation';
import {Pin, PinSlash, Xmark} from '@gravity-ui/icons';
import './EventsSidePanel.scss';
import {MetaData} from '../EventsTimeline/MetaData';
import {SidePanelEmpty} from './SidePanelEmpty';
import i18n from './i18n';

const block = cn('yt-events-side-panel');

type Props = {
    pinned: boolean;
    savingPin: boolean;
    onTogglePin: () => void;
    onClose: () => void;
};

export const EventsSidePanel: FC<Props> = ({pinned, savingPin, onTogglePin, onClose}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const id = useSelector(selectActiveJob);
    const job = useSelector(selectSelectedJob);
    const cluster = useSelector(selectCluster);
    const operationId = useSelector(selectOperationId);

    if (!id || !job) return <SidePanelEmpty />;

    return (
        <div ref={containerRef} className={block()}>
            <Flex alignItems="start" justifyContent="space-between" gap={2}>
                <Flex className={block('job-id')} alignItems="center" gap={1}>
                    <Text variant="subheader-3">
                        {i18n('field_job-id')}{' '}
                        <Link
                            theme="primary"
                            url={`/${cluster}/job/${operationId}/${id}`}
                            target="_blank"
                        >
                            {id}
                        </Link>
                    </Text>
                </Flex>
                <Flex className={block('actions')} gap={1}>
                    <Tooltip content={i18n(pinned ? 'action_unpin' : 'action_pin')}>
                        <Button
                            view="flat"
                            aria-label={i18n(pinned ? 'action_unpin' : 'action_pin')}
                            disabled={savingPin}
                            onClick={onTogglePin}
                        >
                            <Icon data={pinned ? PinSlash : Pin} size={16} />
                        </Button>
                    </Tooltip>
                    <Tooltip content={i18n('action_close')}>
                        <Button view="flat" aria-label={i18n('action_close')} onClick={onClose}>
                            <Icon data={Xmark} size={16} />
                        </Button>
                    </Tooltip>
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
