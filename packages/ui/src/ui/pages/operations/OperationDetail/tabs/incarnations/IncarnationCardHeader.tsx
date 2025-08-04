import React from 'react';
import {useSelector} from 'react-redux';
import {Button, Disclosure, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {Page} from '../../../../../../shared/constants/settings';

import StatusLabel from '../../../../../components/StatusLabel/StatusLabel';
import {formatInterval} from '../../../../../components/common/Timeline';
import YTLink from '../../../../../components/Link/Link';
import AttributesButton from '../../../../../components/AttributesButton/AttributesButton';

import type {
    Incarnation,
    IncarnationFinishReason,
} from '../../../../../store/selectors/operations/incarnations';
import {getCluster} from '../../../../../store/selectors/global';
import {getOperation} from '../../../../../store/selectors/operations/operation';

import {incarnationButtonCn} from './constants';

function makeIncarnationInterval(incarnation: Incarnation) {
    const {start_datetime, finish_datetime} = incarnation;
    if (start_datetime && finish_datetime) {
        return formatInterval(start_datetime, finish_datetime);
    }
    if (start_datetime) {
        return String(start_datetime);
    }
    return '-';
}

function makeStatus(status: IncarnationFinishReason) {
    if (status.startsWith('Job')) {
        const s = status.split(' ')?.[1];
        if (s === 'interrupted') {
            return 'suspended';
        }
        return status.split('_')[1];
    }

    return status.toLowerCase();
}

type Props = {
    incarnation: Incarnation;
};

export function IncarnationCardHeader(props: Props) {
    const {incarnation} = props;

    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    return (
        <Disclosure.Summary>
            {(props) => (
                <Flex justifyContent={'space-between'} style={{overflow: 'hidden'}}>
                    <Button {...props} view={'flat'} className={incarnationButtonCn}>
                        <Flex alignItems={'center'} gap={2} style={{height: '100%'}}>
                            <Text variant={'subheader-2'}>{incarnation.id}</Text>
                            <Icon data={props.expanded ? ChevronUp : ChevronDown} size={'16'} />
                        </Flex>
                    </Button>
                    <Flex direction={'row'} gap={4} alignItems={'center'}>
                        {incarnation?.trigger_job_id && (
                            <YTLink
                                routed
                                url={`/${cluster}/${Page.JOB}/${operation.id}/${incarnation.trigger_job_id}`}
                            >
                                Trigger job info
                            </YTLink>
                        )}
                        <StatusLabel
                            text={incarnation.finish_reason}
                            state={makeStatus(incarnation.finish_reason)}
                            iconState={makeStatus(incarnation.finish_reason)}
                            showIcon={false}
                            renderPlaque
                        />
                        <Text whiteSpace={'nowrap'} variant={'inherit'} ellipsis>
                            {makeIncarnationInterval(incarnation)}
                        </Text>
                        <AttributesButton />
                    </Flex>
                </Flex>
            )}
        </Disclosure.Summary>
    );
}

IncarnationCardHeader.displayName = 'DisclosureSummary';
