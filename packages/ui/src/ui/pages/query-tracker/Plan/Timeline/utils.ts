import * as React from 'react';

import {TimelineEvent} from '@yandex-nirvana/ya-timeline';
import {colord, extend} from 'colord';
import mixPlugin from 'colord/plugins/mix';
import _ from 'lodash';
import {Progress} from '../models/plan';
import {DataSet} from 'vis-data';

import {GraphColors} from '../GraphColors';
import {ProcessedNode} from '../utils';

import {AxisProps} from './Timeline';
import {EventGroup} from './TimelineCanvas';

export const MIN_RANGE = 60_000;

const RESERVE_TO_EVENT = 1_000;

const eventStatusToColorName = {
    NOT_STARTED: 'new',
    STARTED: 'started',
    IN_PROGRESS: 'running',
    FINISHED: 'completed',
    FAILED: 'failed',
    ABORTED: 'aborted',
} as const;

export type OperationColorsType = Record<string, {percentage: number; color: string}>;

export type OperationType = TimelineEvent & {
    eventsCount: number;
    colors: OperationColorsType;
    borderColor?: string;
    backgroundColor?: string;
    id?: number;
    name?: string;
    to: number;
};

type OperationTypeRaw = Omit<OperationType, 'colors'>;

extend([mixPlugin]);
interface CalcOperationColorsArgs {
    events: OperationTypeRaw[];
    theme: string;
    eventMajorColor: string;
    operationDuration: number;
}

function calcOperationColors({
    events,
    theme,
    eventMajorColor,
    operationDuration,
}: CalcOperationColorsArgs) {
    const operationColors: OperationColorsType = {};
    const eventsLength = events.length;

    const eventsSortedDuration = [...events];
    eventsSortedDuration.sort((a, b) => {
        const durationA = a.to - a.from;
        const durationB = b.to - b.from;
        return durationB - durationA;
    });

    const colordMajorColor = colord(eventMajorColor);

    //It should be added + 2 to eventsLength, otherwise the last color will be too close to white/gray
    const colorsRaw =
        theme === 'light'
            ? colordMajorColor.tints(eventsLength + 2)
            : colordMajorColor.tones(eventsLength + 2);

    const colors = colorsRaw.map((c) => c.toHex());

    events.forEach((event) => {
        const eventDuration = event.to - event.from;

        const colorIndex = eventsSortedDuration.findIndex((el) => el.id === event.id);

        operationColors[event.trackIndex] = {
            percentage: operationDuration > 0 ? eventDuration / operationDuration : 1,
            color: colors[colorIndex],
        };
    });
    return operationColors;
}

interface PrepareEventsArgs {
    stages: Progress['key']['stages'];
    axisId: string;
    dataProgressFinishedAt: string;
    dataProgressStartedAt: string;
}

function prepareEvents({
    stages,
    axisId,
    dataProgressFinishedAt,
    dataProgressStartedAt,
}: PrepareEventsArgs) {
    const dataProgressStartedAtMillis = new Date(dataProgressStartedAt).getTime();
    const dataProgressFinishedAtMillis = new Date(dataProgressFinishedAt).getTime();
    const events: OperationTypeRaw[] = [];
    let eventIndex = 0;

    const eventDraft = {
        renderType: 'operation',
        axisId,
        eventsCount: 1,
    };

    let currentStageIndex = 0;

    events.push({
        ...eventDraft,
        trackIndex: currentStageIndex++,
        from: dataProgressStartedAtMillis,
        to: dataProgressFinishedAtMillis,
        id: eventIndex++,
    });

    stages?.forEach((stage, index) => {
        const nextStage = stages[index + 1] ?? {};
        const [stageName, stageStartedAt] = Object.entries(stage)[0];
        const stageFinishedAt = Object.values(nextStage)[0] ?? dataProgressFinishedAt;

        if (index === 0 && dataProgressStartedAt !== stageStartedAt) {
            events.push({
                ...eventDraft,
                trackIndex: currentStageIndex++,
                from: dataProgressStartedAtMillis,
                to: new Date(stageStartedAt).getTime(),
                name: 'init',
                id: eventIndex++,
            });
        }
        events.push({
            ...eventDraft,
            trackIndex: currentStageIndex++,
            from: new Date(stageStartedAt).getTime(),
            to: new Date(stageFinishedAt).getTime(),
            name: stageName,
            id: eventIndex++,
        });
    });
    return events;
}

export function parseGraph(data: {
    nodes: DataSet<ProcessedNode, 'id'>;
    colors: GraphColors;
    theme: string;
    queryStartedAtMillis: number;
}) {
    const {nodes, colors, theme, queryStartedAtMillis} = data;

    let preparationFinishedAtMillis = Infinity;

    const axes: AxisProps[] = [];

    nodes.forEach((node) => {
        const dataProgress = node.progress;

        const axisDraft = {
            id: node.id,
            label: node.label ?? '',
            events: [],
            level: Number(node.level),
            node,
            isExpandable: false,
        };

        if (!dataProgress) {
            axes.push({
                ...axisDraft,
                from: Infinity,
                to: 0,
                notStarted: true,
                status: 'NotStarted',
            });

            return;
        }

        let dataProgressFinishedAt = '0';
        if (dataProgress.state === 'InProgress') {
            dataProgressFinishedAt = new Date().toString();
        } else if (dataProgress.finishedAt) {
            dataProgressFinishedAt = dataProgress.finishedAt;
        } else if (dataProgress.stages && dataProgress.stages.length > 0) {
            dataProgressFinishedAt = Object.values(
                dataProgress.stages[dataProgress.stages.length - 1],
            )[0];
        }

        const dataProgressStartedAt = dataProgress.startedAt ?? '0';
        const dataProgressStartedAtMillis = new Date(dataProgressStartedAt).getTime();
        const dataProgressFinishedAtMillis = new Date(dataProgressFinishedAt).getTime();
        const dataProgressState = dataProgress.state;
        const operationStatus = dataProgressState ?? 'NotStarted';

        preparationFinishedAtMillis = Math.min(
            dataProgressStartedAtMillis,
            preparationFinishedAtMillis,
        );

        const current: AxisProps = {
            ...axisDraft,
            from: dataProgressStartedAtMillis,
            to: dataProgressFinishedAtMillis,
            status: operationStatus,
        };

        const stages = dataProgress?.stages;

        const events = prepareEvents({
            stages,
            dataProgressFinishedAt,
            dataProgressStartedAt,
            axisId: node.id,
        });

        current.isExpandable = events.length > 1;

        // @ts-ignore
        const eventMajorColor = colors.operation[eventStatusToColorName[operationStatus]];
        const eventBorderColor =
            // @ts-ignore
            colors.operation[`${eventStatusToColorName[operationStatus]}Border`];
        const eventBackgroundColor =
            // @ts-ignore
            colors.operation[`${eventStatusToColorName[operationStatus]}Background`];

        const operationDuration = dataProgressFinishedAtMillis - dataProgressStartedAtMillis;

        const operationColors = calcOperationColors({
            theme,
            events,
            eventMajorColor,
            operationDuration,
        });

        current.events = events.map((event) => ({
            ...event,
            colors: operationColors,
            borderColor: eventBorderColor,
            backgroundColor: eventBackgroundColor,
        }));
        axes.push(current);
    });
    const sortedAxes = _.sortBy(axes, ['level', 'from']);

    if (queryStartedAtMillis !== Infinity && preparationFinishedAtMillis !== Infinity) {
        const preparation = {
            id: 'preparation',
            from: queryStartedAtMillis,
            to: preparationFinishedAtMillis,
            events: [
                {
                    eventsCount: 1,
                    axisId: 'preparation',
                    renderType: 'operation',
                    trackIndex: 0,
                    from: queryStartedAtMillis,
                    to: preparationFinishedAtMillis,
                    colors: {
                        //preparation node may have only FINISHED status
                        0: {
                            percentage: 100,
                            // @ts-ignore
                            color: colors.operation[eventStatusToColorName['Finished']],
                        },
                    },
                },
            ],
            node: {
                label: 'Preparation',
                progress: {state: 'Finished'},
                id: 'preparation',
                level: 0,
            },
            isExpandable: false,
            level: 0,
            status: 'Finished',
            label: 'Preparation',
        } as AxisProps;
        sortedAxes.unshift(preparation);
    }

    return sortedAxes;
}

interface CalculateTimelineIntervalProps {
    from?: number;
    to?: number;
    queryStart?: number;
    queryEnd: number;
}

function calculateIntervalDuration({from, to}: {from: number; to: number}) {
    return Math.max(to - from, MIN_RANGE);
}

function calculateTimelineInterval({
    queryStart,
    queryEnd,
    from,
    to,
}: CalculateTimelineIntervalProps) {
    if (!queryStart) {
        return {};
    }
    const queryDuration = calculateIntervalDuration({from: queryStart, to: queryEnd});

    if (!from || !to) {
        return {start: queryStart, end: queryStart + queryDuration};
    }

    const duration = Math.min(calculateIntervalDuration({from, to}), queryDuration);

    const startNotInBounds = (queryStart && from < queryStart) || from > queryEnd;
    const endNotInBounds = queryEnd < to || (queryStart && queryStart > to);

    if (startNotInBounds) {
        return {start: queryStart, end: queryStart + duration};
    }

    if (endNotInBounds) {
        return {start: queryEnd - duration, end: queryEnd};
    }
    return {start: from, end: from + duration};
}

export function useTimelineInterval(axes: AxisProps[]) {
    const [{start, end}, setUserInterval] = React.useState<{start?: number; end?: number}>({});

    const rulerId = React.useRef(false);
    const intervalWasSetByUser = React.useRef(false);

    const {queryStart, queryEnd} = React.useMemo(() => {
        const firstEvent = _.minBy(axes, 'from');
        const lastEvent: EventGroup = _.maxBy(axes, 'to') ?? Object.create(null);

        const queryStart = firstEvent ? firstEvent.from - RESERVE_TO_EVENT : undefined;

        const queryEnd =
            lastEvent.to && queryStart
                ? lastEvent.to + (lastEvent.to - queryStart) * 0.08
                : new Date().getTime();

        return {queryStart, queryEnd};
    }, [axes]);

    const {start: timelineStart, end: timelineEnd} = calculateTimelineInterval({
        from: start,
        to: end,
        queryStart,
        queryEnd,
    });

    if (intervalWasSetByUser.current && !start && !end) {
        rulerId.current = !rulerId.current;
    }

    intervalWasSetByUser.current = Boolean(start || end);

    const timelineRulerKey = `ruler-${rulerId.current}`;

    return [{timelineStart, timelineEnd, timelineRulerKey}, setUserInterval] as const;
}
