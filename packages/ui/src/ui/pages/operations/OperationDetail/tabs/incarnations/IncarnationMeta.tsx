import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {Flex, Label, Text} from '@gravity-ui/uikit';

import {YTError} from '../../../../../../@types/types';
import {Page} from '../../../../../../shared/constants/settings';

import format from '../../../../../common/hammer/format';

import {getCluster} from '../../../../../store/selectors/global';
import {getOperation} from '../../../../../store/selectors/operations/operation';
import type {Incarnation} from '../../../../../store/selectors/operations/incarnations';
import {showErrorModal} from '../../../../../store/actions/actions';

import MetaTable from '../../../../../components/MetaTable/MetaTable';
import YTLink from '../../../../../components/Link/Link';
import {Template} from '../../../../../components/MetaTable/templates/Template';

import i18n from './i18n';

type Props = {
    incarnation: Incarnation;
};

export function IncarnationMeta(props: Props) {
    const {incarnation} = props;

    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    const {switch_info} = incarnation;

    const tableItems = [
        {
            key: 'trigger_job_id',
            value: (
                <YTLink
                    routed
                    url={`/${cluster}/${Page.JOB}/${operation.id}/${incarnation.trigger_job_id}`}
                >
                    {incarnation.trigger_job_id}
                </YTLink>
            ),
            label: i18n('id'),
            visible: Boolean(incarnation?.trigger_job_id),
        },
        {
            key: 'abort_reason',
            value: (
                <Label theme={'unknown'}>
                    {format.ReadableField(String(switch_info?.abort_reason))}
                </Label>
            ),
            label: i18n('abort-reason'),
            visible: Boolean(switch_info?.abort_reason),
        },
        {
            key: 'interruption_reason',
            value: (
                <Label theme={'unknown'}>
                    {format.ReadableField(String(switch_info?.interruption_reason))}
                </Label>
            ),
            label: i18n('interruption-reason'),
            visible: Boolean(switch_info?.interruption_reason),
        },
        {
            key: 'error',
            value: (
                <Template.Error
                    error={switch_info?.trigger_job_error as YTError}
                    onClick={() => dispatch(showErrorModal(switch_info?.trigger_job_error))}
                />
            ),
            label: i18n('error'),
            visible: Boolean(switch_info?.trigger_job_error),
        },
    ];

    return (
        <Flex gap={1} direction={'column'} width={'40%'}>
            <Text variant={'subheader-2'}>{i18n('trigger-job-info')}</Text>
            <MetaTable items={tableItems} />
            {!tableItems.some((item) => item.visible) && (
                <Text variant={'inherit'}> {i18n('no-info-to-display')}</Text>
            )}
        </Flex>
    );
}
