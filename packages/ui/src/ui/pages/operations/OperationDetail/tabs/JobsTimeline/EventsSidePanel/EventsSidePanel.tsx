import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {
    getSelectedJob,
    selectActiveJob,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import cn from 'bem-cn-lite';
import {EventsTable} from './EventsTable';
import {getCluster} from '../../../../../../store/selectors/global';
import {getOperationId} from '../../../../../../store/selectors/operations/operation';
import './EventsSidePanel.scss';

const block = cn('yt-events-side-panel');

type Props = {
    onClose: () => void;
};

export const EventsSidePanel: FC<Props> = ({onClose}) => {
    const {id} = useSelector(selectActiveJob);
    const job = useSelector(getSelectedJob);
    const cluster = useSelector(getCluster);
    const operationId = useSelector(getOperationId);

    if (!id || !job) return null;

    return (
        <div className={block()}>
            <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" justifyContent="center" gap={1}>
                    <Text variant="subheader-3">{id}</Text>
                    <Link href={`/${cluster}/job/${operationId}/${id}`} target="_blank">
                        <Icon data={ArrowUpRightFromSquareIcon} width={16} />
                    </Link>
                </Flex>
                <Button view="flat" onClick={onClose}>
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </Flex>
            <div className={block('separator')} />
            <EventsTable events={job.events} />
        </div>
    );
};
