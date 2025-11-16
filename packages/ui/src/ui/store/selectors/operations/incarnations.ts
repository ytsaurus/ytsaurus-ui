import {createSelector} from '@reduxjs/toolkit';

import {YTError} from '../../../../@types/types';

import {IncarnationSwitchReason, OperationEvent} from '../../../../shared/yt-types';

import format from '../../../common/hammer/format';

import {getIdFilter, getIncarnationsList} from '../../../store/reducers/operations/incarnations';
import {getIncarnations} from '../../../store/api/yt';
import {OperationSelector, OperationStates} from '../../../pages/operations/selectors';
import {ViewState} from '../../../components/StatusLabel/StatusLabel';
import {formatInterval} from '../../../components/common/Timeline';
import {dateTimeParse} from '../../../utils/date-utils';

import {getOperation} from './operation';

export type IncarnationFinishReason =
    | IncarnationSwitchReason
    | `operation_${OperationStates}`
    | 'running'
    | 'finished'
    | 'system';

export type Incarnation = {
    id: string;
    switch_info: Record<string, unknown>;
    trigger_job_id?: string;
    finish_reason: string; // formatted IncarnationFinishReason
    finish_status: ViewState;
    switch_reason?: string;
    interval: string;
};

export type Incarnations = Array<Incarnation>;

function makeFinishReason(event: OperationEvent, operation: OperationSelector, isLast: boolean) {
    if (
        ['job_aborted', 'job_failed', 'job_interrupted'].includes(
            String(event?.incarnation_switch_reason),
        ) &&
        event?.incarnation_switch_reason
    ) {
        return event.incarnation_switch_reason;
    }

    if (event?.incarnation_switch_reason === 'job_lack_after_revival' || !isLast) {
        return 'system' as IncarnationFinishReason;
    }

    return `operation_${operation.state}` as IncarnationFinishReason;
}

function makeStatus(status: IncarnationFinishReason): ViewState {
    if (status.startsWith('job')) {
        const s = status.split('_')[1];
        if (s === 'interrupted') {
            return 'suspended';
        }
        return s as ViewState;
    }

    if (status === 'system') {
        return 'unknown';
    }

    if (status.startsWith('operation')) {
        return status.split('_')[1] as ViewState;
    }

    return status.toLowerCase() as ViewState;
}

function makeInterval(startDatetime: string, finishDatetime: string) {
    if (startDatetime && finishDatetime) {
        return formatInterval(startDatetime, finishDatetime);
    }
    if (startDatetime) {
        return format.DateTime(startDatetime);
    }
    return format.NO_VALUE;
}

export const getIncarnationsInfo = createSelector(
    [getOperation, getIncarnationsList, getIdFilter, getIncarnations],
    (operation, operationEvents, idFilter, incarnationsReqInfo) => {
        let incarnations: Incarnations = [];

        const {isLoading, error} = incarnationsReqInfo;

        if (!operationEvents) {
            return {incarnations, isLoading, error: error as YTError | undefined};
        }

        for (let i = 0; i < operationEvents.length; i++) {
            const event = operationEvents[i];
            const nextIncarnation = operationEvents?.[i + 1];
            const nextIncarnationStartTime = nextIncarnation?.timestamp;
            const nextIncarnationTriggerJobId = nextIncarnation?.incarnation_switch_info
                ?.trigger_job_id as string | undefined;
            const switchReason = nextIncarnation?.incarnation_switch_reason;
            const switchInfo = nextIncarnation?.incarnation_switch_info;

            const finishReason = makeFinishReason(
                nextIncarnation,
                operation,
                i === operationEvents.length - 1,
            );

            const startDatetime = event.timestamp;
            const finishDatetime =
                nextIncarnationStartTime ??
                operation?.finishTime ??
                dateTimeParse('now')?.format('YYYY-MM-DDTHH:mm:ssZ');

            const incarnation: Incarnation = {
                id: event.incarnation,
                interval: makeInterval(startDatetime, finishDatetime),
                trigger_job_id: nextIncarnationTriggerJobId,
                switch_reason: switchReason,
                finish_reason: format.ReadableField(finishReason),
                finish_status: makeStatus(finishReason),
                switch_info: switchInfo,
            };

            incarnations.push(incarnation);
        }

        if (idFilter) {
            incarnations = incarnations.filter((inc) => inc.id.startsWith(idFilter)).reverse();
        }

        return {
            incarnations: incarnations?.reverse(),
            count: operationEvents?.length,
            isLoading,
            error: error as YTError | undefined,
        };
    },
);
