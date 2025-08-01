import React from 'react';
import {dateTimeParse} from '@gravity-ui/date-utils';
import {createSelector} from '@reduxjs/toolkit';

import {IncarnationSwitchReason, OperationEvent} from '../../../../shared/yt-types';
import {YTError} from '../../../../@types/types';
import format from '../../../common/hammer/format';

import {getOperationEvents} from '../../../store/api/yt';
import {getIdFilter} from '../../../store/reducers/operations/incarnations';
import {OperationSelector} from '../../../pages/operations/selectors';

import {getOperation} from './operation';

export type IncarnationFinishReason = IncarnationSwitchReason | 'running' | 'finished' | 'system';

export type Incarnation = {
    id: string;
    // timestamp
    start_datetime: string;
    // next incarnation ?? operation end timestamp ?? Date.now()
    finish_datetime: string;
    switch_info: Array<{key: string; label: string; value: React.ReactNode}>;
    trigger_job_id?: string;
    finish_reason: IncarnationFinishReason;
};

export type Incarnations = Array<Incarnation>;

function makeFinishReason(event: OperationEvent, operation: OperationSelector) {
    if (
        ['job_aborted', 'job_failed', 'job_interrupted'].includes(
            String(event?.incarnation_switch_reason),
        )
    ) {
        return format.ReadableField(event?.incarnation_switch_reason);
    }

    if (event?.incarnation_switch_reason === 'job_lack_after_revival') {
        return 'System';
    }

    return format.ReadableField(operation.state);
}

export const getIncarnationsInfo = createSelector(
    [getOperation, getOperationEvents, getIdFilter],
    (operation, events, idFilter) => {
        const {data: operationEvents, isLoading, error} = events;
        let incarnations: Incarnations = [];

        if (!operationEvents) {
            return {incarnations, isLoading, error: error as YTError | undefined};
        }

        for (let i = 0; i < operationEvents.length; i++) {
            const event = operationEvents[i];
            const nextIncarnation = operationEvents?.[i + 1];
            const nextIncarnationStartTime = nextIncarnation?.timestamp;

            const switch_info = Object.entries(event.incarnation_switch_info).map(
                ([key, value]) => ({
                    key,
                    value: value as React.ReactNode,
                    label: format.ReadableField(key) as string,
                }),
            );

            const incarnation: Incarnation = {
                id: event.incarnation,
                start_datetime: event.timestamp,
                finish_datetime:
                    nextIncarnationStartTime ?? operation?.finishTime ?? dateTimeParse('now'),
                finish_reason: makeFinishReason(nextIncarnation, operation),
                trigger_job_id: event?.incarnation_switch_info?.trigger_job_id as
                    | string
                    | undefined,
                switch_info,
            };

            incarnations.push(incarnation);
        }

        if (idFilter) {
            incarnations = incarnations.filter((inc) => inc.id.startsWith(idFilter));
        }

        return {incarnations, isLoading, error: error as YTError | undefined};
    },
);
