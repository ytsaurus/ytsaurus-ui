import _ from 'lodash';
import moment from 'moment';

import ypath from '../../../../../common/thor/ypath';
import _isEmpty from 'lodash/isEmpty';

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
        let prepared = _.reduce(
            events,
            (prepared, event, index) => {
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

                if (!_isEmpty(event.attributes)) {
                    showAttributesColumn = true;
                }

                prepared.totalDuration += duration;
                prepared.events.push(
                    new Event({
                        duration: duration,
                        finishTime: finishTime,
                        time: event.time,
                        state: event.state || lastState,
                        originalState: event.state,
                        phase: event.phase,
                        attributes: event.attributes,
                    }),
                );

                return prepared;
            },
            {events: [], totalDuration: 0, precedingDuration: 0},
        );

        const eventsDurations = _.map(prepared.events, 'duration');

        prepared = _.reduce(
            eventsDurations,
            (prepared, duration, index) => {
                const currentEvent = prepared.events[index];
                const totalDuration = prepared.totalDuration;
                const precedingDuration = prepared.precedingDuration;

                currentEvent.progress = {
                    duration: durationToPercentage(duration, totalDuration),
                    precedingDuration: durationToPercentage(precedingDuration, totalDuration),
                };

                prepared.precedingDuration += duration;

                return prepared;
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
