import {dateTimeParse} from '@gravity-ui/date-utils';
import {createSelector} from '@reduxjs/toolkit';

import {YTError} from '../../../../@types/types';

import {IncarnationSwitchReason, OperationEvent} from '../../../../shared/yt-types';

import {getIdFilter, getIncarnationsList} from '../../../store/reducers/operations/incarnations';
import {getIncarnations} from '../../../store/api/yt';
import {OperationSelector, OperationStates} from '../../../pages/operations/selectors';

import {getOperation} from './operation';

export type IncarnationFinishReason =
    | IncarnationSwitchReason
    | `operation_${OperationStates}`
    | 'running'
    | 'finished'
    | 'system';

export type Incarnation = {
    id: string;
    // timestamp
    start_datetime: string;
    // next incarnation ?? operation end timestamp ?? Date.now()
    finish_datetime: string;
    switch_info: Record<string, unknown>;
    trigger_job_id?: string;
    finish_reason: IncarnationFinishReason;
    switch_reason?: string;
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
        return 'system' as const;
    }

    return `operation_${operation.state}` as const;
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

            const incarnation: Incarnation = {
                id: event.incarnation,
                start_datetime: event.timestamp,
                finish_datetime:
                    nextIncarnationStartTime ??
                    operation?.finishTime ??
                    dateTimeParse('now')?.format('YYYY-MM-DDTHH:mm:ssZ'),
                finish_reason: makeFinishReason(
                    nextIncarnation,
                    operation,
                    i === operationEvents.length - 1,
                ),
                trigger_job_id: nextIncarnationTriggerJobId,
                switch_reason: switchReason,
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
