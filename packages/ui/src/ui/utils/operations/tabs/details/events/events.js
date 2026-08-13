import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import moment from 'moment';

import ypath from '../../../../../common/thor/ypath';
import isEmpty_ from 'lodash/isEmpty';

export class Event {
    constructor(data) {
        Object.assign(this, data);
    }

    static COMPLETED_STATES = ['completed', 'failed', 'aborted'];

    static isFinalState(event) {
        return Event.COMPLETED_STATES.indexOf(event.state) !== -1;
    }

    static isNotFinalState(event) {
        return !Event.isFinalState(event);
    }
}

function durationToPercentage(duration, totalDuration) {
    return (duration / totalDuration) * 100;
}

function prepareEvents(events, params) {
    let showAttributesColumn = false;
    const {finishTime: endTime} = params;

    if (events) {
        let lastState;
        let prepared = reduce_(
            events,
            (accPrepared, event, index) => {
                const nextEvent = events[index + 1];
                let duration;
                let finishTime;

                if (event.state) {
                    lastState = event.state;
                }

                if (nextEvent) {
                    finishTime = nextEvent.time;
                    duration = moment(finishTime) - moment(event.time);
                } else {
                    finishTime = endTime ? endTime : moment().toISOString();
                    duration = moment(finishTime) - moment(event.time);
                }

                if (!isEmpty_(event.attributes)) {
                    showAttributesColumn = true;
                }

                accPrepared.totalDuration += duration;
                accPrepared.events.push(
                    new Event({
                        duration,
                        finishTime,
                        time: event.time,
                        state: event.state || lastState,
                        originalState: event.state,
                        phase: event.phase,
                        attributes: event.attributes,
                    }),
                );

                return accPrepared;
            },
            {events: [], totalDuration: 0, precedingDuration: 0},
        );

        const eventsDurations = map_(prepared.events, 'duration');

        prepared = reduce_(
            eventsDurations,
            (accPrepared, duration, index) => {
                const currentEvent = accPrepared.events[index];
                const totalDuration = accPrepared.totalDuration;
                const precedingDuration = accPrepared.precedingDuration;

                currentEvent.progress = {
                    duration: durationToPercentage(duration, totalDuration),
                    precedingDuration: durationToPercentage(precedingDuration, totalDuration),
                };

                accPrepared.precedingDuration += duration;

                return accPrepared;
            },
            prepared,
        );

        prepared.events.push(
            new Event({
                duration: params.duration,
                finishTime: params.finishTime,
                state: 'total',
                phase: 'total',
                showAttributesColumn,
            }),
        );

        return prepared.events;
    }
}

export function prepareOperationEvents(operation) {
    const events = ypath.getValue(operation, '/@events');

    return prepareEvents(events, operation);
}

export function prepareJobEvents(job) {
    const events = ypath.getValue(job, '/attributes/events');

    return prepareEvents(events, job);
}
