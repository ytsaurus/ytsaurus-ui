import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {type ButtonProps, ClipboardButton, Flex, Text} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

import {Page} from '../../../../../../shared/constants/settings';

import StatusLabel from '../../../../../components/StatusLabel/StatusLabel';
import Link from '../../../../../components/Link/Link';
import AttributesButton from '../../../../../components/AttributesButton/AttributesButton';

import {toggleIncarnationInfoDialog} from '../../../../../store/reducers/operations/incarnations';
import type {Incarnation} from '../../../../../store/selectors/operations/incarnations';
import {getCluster} from '../../../../../store/selectors/global';
import {getOperation} from '../../../../../store/selectors/operations/operation';

import {IncarnationButton} from './IncarnationButton';

import i18n from './i18n';

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
                <IncarnationButton incarnationId={incarnation.id} {...props} />
                <ClipboardButton text={incarnation.id} />
                <Link
                    routed
                    target={'_blank'}
                    url={`/${cluster}/${Page.OPERATIONS}/${operation.id}/jobs?state=all&incarnation=${incarnation.id}`}
                >
                    <Flex alignItems={'center'} gap={1}>
                        {i18n('jobs')}
                        <ArrowUpRightFromSquare />
                    </Flex>
                </Link>
            </Flex>
            <Flex direction={'row'} gap={4} alignItems={'center'}>
                <StatusLabel
                    text={incarnation.finish_reason}
                    state={incarnation.finish_status}
                    hideIcon
                    renderPlaque
                />
                <Text whiteSpace={'nowrap'} variant={'inherit'} ellipsis>
                    {incarnation.interval}
                </Text>
                <AttributesButton
                    onClick={() =>
                        dispatch(
                            toggleIncarnationInfoDialog({infoDialog: {incarnation, visible: true}}),
                        )
                    }
                />
            </Flex>
        </Flex>
    );
}
