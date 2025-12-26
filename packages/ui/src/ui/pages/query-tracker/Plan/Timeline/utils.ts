import {colord, extend} from 'colord';
import mixPlugin from 'colord/plugins/mix';
import sortBy_ from 'lodash/sortBy';
import {Progress} from '../models/plan';

import {GraphColors} from '../GraphColors';
import {ProcessedNode} from '../utils';
import {TimelineEvent} from '@gravity-ui/timeline';
import {OperationRenderer} from './renderer/OperationRenderer';

const eventStatusToColorName = {
    NotStarted: 'new',
    Started: 'started',
    InProgress: 'running',
    Finished: 'completed',
    Failed: 'failed',
    Aborted: 'aborted',
} as const;

export type OperationColorsType = Record<string, {percentage: number; color: string}>;

export type OperationTimeline = TimelineEvent & {
    eventsCount: number;
    colors: OperationColorsType;
    borderColor?: string;
    backgroundColor?: string;
    name?: string;
    to: number;
    isExpanded: boolean;
};

type OperationTypeRaw = Omit<OperationTimeline, 'colors'>;

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
        isExpanded: false,
    };

    let currentStageIndex = 0;

    events.push({
        ...eventDraft,
        trackIndex: currentStageIndex++,
        from: dataProgressStartedAtMillis,
        to: dataProgressFinishedAtMillis,
        id: `${axisId}_${eventIndex++}`,
        renderer: new OperationRenderer(),
    });

    if (stages) {
        Object.values(stages).forEach((stage, index) => {
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
                    id: `${axisId}_${eventIndex++}`,
                });
            }
            events.push({
                ...eventDraft,
                trackIndex: currentStageIndex++,
                from: new Date(stageStartedAt).getTime(),
                to: new Date(stageFinishedAt).getTime(),
                name: stageName,
                id: `${axisId}_${eventIndex++}`,
            });
        });
    }

    return events;
}

export type RawAxis = {
    id: string;
    label: string;
    events: OperationTimeline[];
    from: number;
    to: number;
    notStarted?: boolean;
    status: string;
    level: number;
    node: ProcessedNode;
    isExpandable: boolean;
    link?: {cluster: string; path: string};
};

export type RowType = Partial<RawAxis> & {
    isExpanded?: boolean;
    isEvent?: boolean;
    name?: string;
    tracksCount?: number;
    axisId?: string;
    node: ProcessedNode;
};

const getNodeLink = (data?: string) => {
    if (!data) return undefined;

    const cluster = data.match(/^(\w+)(?=\.)/)?.[0];
    const path = data.match(/`([^`]+)`/)?.[1];

    if (!cluster || !path) return undefined;

    return {cluster, path};
};

export function parseGraph(data: {
    nodes: ProcessedNode[];
    colors: GraphColors;
    theme: string;
    queryStartedAtMillis: number;
}) {
    const {nodes, colors, theme, queryStartedAtMillis} = data;

    let preparationFinishedAtMillis = Infinity;

    const axes: RawAxis[] = [];

    nodes.forEach((node) => {
        const dataProgress = node.progress;
        const link = getNodeLink(node.title);

        const axisDraft = {
            id: node.id,
            label: node.label ?? '',
            events: [],
            level: Number(node.level),
            node,
            link,
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
        } else if (dataProgress.stages && Object.keys(dataProgress.stages).length > 0) {
            dataProgressFinishedAt = Object.values(
                dataProgress.stages[Object.keys(dataProgress.stages).length - 1],
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

        const current: RawAxis = {
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

        const eventMajorColor = colors.operation[eventStatusToColorName[operationStatus]];
        const eventBorderColor =
            colors.operation[`${eventStatusToColorName[operationStatus]}Border`];
        const eventBackgroundColor =
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
    const sortedAxes = sortBy_(axes, ['level', 'from']);

    if (queryStartedAtMillis !== Infinity && preparationFinishedAtMillis !== Infinity) {
        const preparation = {
            id: 'preparation',
            from: queryStartedAtMillis,
            to: preparationFinishedAtMillis,
            events: [
                {
                    id: 'preparation',
                    eventsCount: 1,
                    axisId: 'preparation',
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
                    isExpanded: false,
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
        } as RawAxis;
        sortedAxes.unshift(preparation);
    }

    return sortedAxes;
}
