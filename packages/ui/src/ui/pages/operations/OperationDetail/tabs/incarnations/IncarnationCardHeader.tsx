import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, type ButtonProps, ClipboardButton, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare, ChevronDown, ChevronUp} from '@gravity-ui/icons';

import format from '../../../../../common/hammer/format';

import {Page} from '../../../../../../shared/constants/settings';

import StatusLabel, {ViewState} from '../../../../../components/StatusLabel/StatusLabel';
import Link from '../../../../../components/Link/Link';
import {formatInterval} from '../../../../../components/common/Timeline';
import AttributesButton from '../../../../../components/AttributesButton/AttributesButton';

import {toggleIncarnationInfoDialog} from '../../../../../store/reducers/operations/incarnations';
import type {
    Incarnation,
    IncarnationFinishReason,
} from '../../../../../store/selectors/operations/incarnations';
import {getCluster} from '../../../../../store/selectors/global';
import {getOperation} from '../../../../../store/selectors/operations/operation';

import {incarnationButtonCn} from './constants';

import i18n from './i18n';

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
    if (status.startsWith('job')) {
        const s = status.split('_')?.[1];
        if (s === 'interrupted') {
            return 'suspended';
        }
        return status.split('_')[1] as ViewState;
    }

    if (status === 'system') {
        return 'unknown';
    }

    if (status.startsWith('operation')) {
        return status.split('_')[1] as ViewState;
    }

    return status.toLowerCase() as ViewState;
}

type Props = {
    incarnation: Incarnation;
    expanded: boolean;
} & ButtonProps;

export function IncarnationCardHeader(props: Props) {
    const {incarnation} = props;

    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    return (
        <Flex justifyContent={'space-between'} style={{overflow: 'hidden'}}>
            <Flex direction={'row'} gap={2} alignItems={'center'}>
                <Button {...props} view={'flat'} width={'max'} className={incarnationButtonCn}>
                    <Flex alignItems={'center'} gap={2} style={{height: '100%'}}>
                        <Text variant={'subheader-2'}>{incarnation.id}</Text>
                        <Icon data={props.expanded ? ChevronUp : ChevronDown} size={'16'} />
                    </Flex>
                </Button>
                <ClipboardButton text={incarnation.id} />
                <Link
                    routed
                    target={'_blank'}
                    url={`/${cluster}/${Page.OPERATIONS}/${operation.id}/jobs?state=all&incarnation=${incarnation.id}`}
                >
                    <Flex alignContent={'center'} gap={1}>
                        {i18n('jobs')}
                        <ArrowUpRightFromSquare />
                    </Flex>
                </Link>
            </Flex>
            <Flex direction={'row'} gap={4} alignItems={'center'}>
                <StatusLabel
                    text={format.ReadableField(incarnation.finish_reason)}
                    state={makeStatus(incarnation.finish_reason)}
                    showIcon={false}
                    renderPlaque
                />
                <Text whiteSpace={'nowrap'} variant={'inherit'} ellipsis>
                    {makeIncarnationInterval(incarnation)}
                </Text>
                <AttributesButton
                    onClick={() =>
                        dispatch(toggleIncarnationInfoDialog({infoDialog: {incarnation}}))
                    }
                />
            </Flex>
        </Flex>
    );
}
