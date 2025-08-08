import React from 'react';
import {Button, ClipboardButton, Disclosure, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import StatusLabel, {ViewState} from '../../../../../components/StatusLabel/StatusLabel';
import {formatInterval} from '../../../../../components/common/Timeline';
import AttributesButton from '../../../../../components/AttributesButton/AttributesButton';

import type {
    Incarnation,
    IncarnationFinishReason,
} from '../../../../../store/selectors/operations/incarnations';

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

function makeStatus(status: IncarnationFinishReason): ViewState {
    if (status.startsWith('Job')) {
        const s = status.split(' ')?.[1];
        if (s === 'interrupted') {
            return 'suspended';
        }
        return status.split('_')[1] as ViewState;
    }

    return status.toLowerCase() as ViewState;
}

type Props = {
    incarnation: Incarnation;
};

export function IncarnationCardHeader(props: Props) {
    const {incarnation} = props;

    return (
        <Disclosure.Summary>
            {(props) => (
                <Flex justifyContent={'space-between'} style={{overflow: 'hidden'}}>
                    <Flex direction={'row'} gap={2}>
                        <Button
                            {...props}
                            view={'flat'}
                            width={'max'}
                            className={incarnationButtonCn}
                        >
                            <Flex alignItems={'center'} gap={2} style={{height: '100%'}}>
                                <Text variant={'subheader-2'}>{incarnation.id}</Text>
                                <Icon data={props.expanded ? ChevronUp : ChevronDown} size={'16'} />
                            </Flex>
                        </Button>
                        <ClipboardButton text={incarnation.id} />
                    </Flex>
                    <Flex direction={'row'} gap={4} alignItems={'center'}>
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
