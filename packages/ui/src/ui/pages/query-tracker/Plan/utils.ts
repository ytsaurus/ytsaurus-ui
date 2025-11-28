import * as React from 'react';

import {yqlModel} from './models/shared';
import {scaleOrdinal} from 'd3-scale';
import {select} from 'd3-selection';
import {arc, pie} from 'd3-shape';
import isEmpty_ from 'lodash/isEmpty';
import type {
    NodeDetails,
    NodeProgress,
    NodeStages,
    NodeState,
    Plan,
    Progress,
    Provider,
} from './models/plan';

import type {DataSet, Edge, Network, Node} from 'vis-network';

import type {GraphColors} from './GraphColors';

import {DateTime} from 'luxon';

export type ParsableDate = string | number | Date | DateTime | {} | undefined | null;

export function parseDate(date: ParsableDate) {
    if (typeof date === 'number') {
        return DateTime.fromMillis(date);
    }
    if (typeof date === 'string') {
        return DateTime.fromISO(date);
    }
    if (date instanceof Date) {
        return DateTime.fromJSDate(date);
    }
    return DateTime.isDateTime(date) ? date : DateTime.now();
}

export function hasKey<T, K extends PropertyKey>(obj: T, key: K): obj is T & Record<K, T[keyof T]> {
    return typeof obj === 'object' && obj && Reflect.has(obj as any, key);
}

export function rafThrottle<T extends any[]>(callback: (...args: T) => void) {
    let requestId: number | null = null;

    let lastArgs: T;

    function later() {
        return () => {
            requestId = null;
            callback(...lastArgs);
        };
    }

    const throttled = function (...args: T) {
        lastArgs = args;
        if (requestId === null) {
            requestId = requestAnimationFrame(later());
        }
    };

    throttled.cancel = () => {
        if (requestId) {
            cancelAnimationFrame(requestId);
        }
        requestId = null;
    };

    return throttled;
}

export const operationsStateConfig: Record<NodeState | 'NotStarted', {title: string}> = {
    NotStarted: {
        title: 'Not started',
    },
    Started: {
        title: 'Waiting',
    },
    InProgress: {
        title: 'Running',
    },
    Finished: {
        title: 'Completed',
    },
    Failed: {
        title: 'Failed',
    },
    Aborted: {
        title: 'Aborted',
    },
};

const LINE_WIDTH = 25;

function ellipsis(input: string) {
    if (input.length > LINE_WIDTH) {
        return '…' + input.slice(-LINE_WIDTH);
    } else {
        return input;
    }
}

function getLabelWithStage(name: string, stages: NodeStages) {
    try {
        const stage = Object.keys(stages[Object.keys(stages).length - 1])[0];
        return `${ellipsis(name)}\n(${stage})`;
    } catch {
        return '';
    }
}

export function duration(
    date1: string | number | undefined,
    date2: string | number | undefined,
    durationFormat = 'h:mm:ss.SSS',
) {
    const _date1 = parseDate(date1);
    const _date2 = parseDate(date2);
    const d = _date2.diff(_date1);
    if (_date1 > _date2) {
        return d.negate().toFormat(durationFormat);
    }
    return d.toFormat(durationFormat);
}

export function isOperationFinished(state: NodeState | undefined) {
    return state && ['Finished', 'Failed', 'Aborted'].indexOf(state) >= 0;
}

export function isOperationFailed(state: NodeState | undefined) {
    return state === 'Failed';
}

type DrawCircleProps = (
    | {
          type: 'new';
          node?: never;
      }
    | {
          type: 'update';
          node: NodeProgress;
      }
) & {colors: GraphColors};
function drawCircle({type, node, colors: {operation, text}}: DrawCircleProps) {
    const div = document.createElement('div');
    let borderColor!: string;
    const colors: string[] = [];
    const dataset: {label: string; count: number}[] = [];
    const border = 2;
    let textColor = text.operationCount;
    if (type === 'update') {
        switch (node?.state) {
            case 'Started': {
                dataset.push({label: 'Started', count: 1});
                colors.push(operation.started);
                borderColor = operation.startedBorder;
                break;
            }
            case 'Failed': {
                dataset.push({label: 'Failed', count: 1});
                colors.push(operation.failed);
                borderColor = operation.failedBorder;
                break;
            }
            case 'Aborted': {
                dataset.push({label: 'Failed', count: 1});
                colors.push(operation.aborted);
                borderColor = operation.abortedBorder;
                break;
            }
            case 'InProgress': {
                const totalR = node.total || 1;

                const runningPr = Math.round(((node.running ?? 0) / totalR) * 100);
                const completedPr = Math.round(((node.completed ?? 0) / totalR) * 100);
                const leastPr = Math.round(100 - runningPr - completedPr);

                if (completedPr > 0) {
                    dataset.push({label: 'Completed', count: completedPr});
                    colors.push(operation.completed);
                }

                if (runningPr > 0) {
                    dataset.push({label: 'Running', count: runningPr});
                    colors.push(operation.running);
                }

                if (leastPr > 0) {
                    dataset.push({label: 'Least', count: leastPr});
                    colors.push(operation.started);
                }

                textColor = text.label;
                borderColor = operation.runningBorder;
                break;
            }
            case 'Finished': {
                dataset.push({label: 'Completed', count: 1});
                colors.push(operation.completed);
                borderColor = operation.completedBorder;
                break;
            }
        }
    } else {
        dataset.push({label: 'Least', count: 100});
        colors.push(operation.new);
        borderColor = operation.newBorder;
    }

    const color = scaleOrdinal(colors);

    const width = 80;
    const height = 80;
    const radius = Math.min(width, height) / 2;
    const svg = select(div)
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .attr('stroke', borderColor)
        .attr('stroke-width', border)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    const drawArc = arc<(typeof dataset)[number]>()
        .innerRadius(0)
        .outerRadius(radius - 2);

    const pieData = pie<(typeof dataset)[number]>()
        .value((d) => {
            return d.count;
        })
        .sort(null);

    svg.selectAll('path')
        .data(pieData(dataset))
        .enter()
        .append('path')
        // @ts-ignore
        .attr('d', drawArc)
        .attr('fill', (d) => {
            return color(d.data.label);
        });
    if (node && (node.total ?? 0) > 0) {
        const count = Number(node.total ?? 0);
        const fontSize = getFontSize(count);
        svg.selectAll('text')
            .data([node])
            .enter()
            .append('text')
            .text(count)
            .attr('fill', textColor)
            .attr('font-family', 'YS Text, Arial, sans-serif')
            .attr('font-size', `${fontSize}`)
            .attr('stroke-width', '0')
            .attr('transform', `translate(0, ${fontSize / 3})`)
            .attr('text-anchor', 'middle');
    }

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(div.innerHTML);
}

function getFontSize(count: number) {
    const numberOfDigits = Math.floor(Math.log10(count)) + 1;
    switch (numberOfDigits) {
        case 1: {
            return 34;
        }
        case 2: {
            return 30;
        }
        case 3: {
            return 26;
        }
        default: {
            return 24;
        }
    }
}

function drawTable(colors: GraphColors) {
    const fillColor = colors.table.fill1;
    const svg = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M15 7H9v3.5h6V7zm1.5 0v3.5h6V7h-6zM15 12H9v3.5h6V12zm1.5 3.5V12h6v3.5h-6zM15 17H9v3.5h6V17zm1.5 3.5V17h6v3.5h-6zm0 1.5h-15A1.5 1.5 0 010 20.5v-17C0 2.67.67 2 1.5 2h21c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-6zm-9-10v3.5h-6V12h6zm0 5h-6v3.5h6V17zm0-6.5h-6V7h6v3.5z"/>
        </svg>`;

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export interface OperationSchemas {
    inputs: {name: string; type: yqlModel.value.TypeArray}[];
    outputs: {name: string; type: yqlModel.value.TypeArray}[];
}
export interface ProcessedNode extends Node {
    id: string;
    level: number;
    title?: string;
    type?: 'in' | 'out' | 'op';
    progress?: NodeProgress;
    details?: NodeDetails;
    schemas?: OperationSchemas;
    url?: string;
}
export interface ProcessedEdge extends Edge {
    from: string;
    to: string;
}

function collectTables(providers: Provider[], tables: [string, string][]) {
    const result = [];
    for (const [providerId, tableId] of tables) {
        const provider = providers.find(({Id}) => Id === providerId);
        if (provider) {
            const table = provider.Pins.find(({Id}) => Id === tableId);
            if (table && table.Type) {
                result.push({
                    name: `${provider.Cluster}.\`${table.Table}\``,
                    type: table.Type,
                });
            }
        }
    }
    return result;
}

export interface ProcessedGraph {
    nodes: ProcessedNode[];
    edges: ProcessedEdge[];
}
export function preprocess({Basic, Detailed}: Plan): ProcessedGraph {
    const nodes: ProcessedNode[] = [];
    const edges: ProcessedEdge[] = [];

    for (const basicNode of Basic.nodes) {
        const title = basicNode.type === 'op' ? basicNode.name.replace(/!/g, '') : basicNode.name;
        const operationDetails = Detailed?.Operations?.find(({Id}) => Id === basicNode.id);
        const schemas: OperationSchemas = {
            inputs: [],
            outputs: [],
        };
        if (Detailed?.Providers) {
            if (operationDetails?.Inputs && Array.isArray(operationDetails?.Inputs)) {
                schemas.inputs = collectTables(Detailed.Providers, operationDetails.Inputs);
            }
            if (operationDetails?.Outputs && Array.isArray(operationDetails?.Outputs)) {
                schemas.outputs = collectTables(Detailed.Providers, operationDetails.Outputs);
            }
        }
        nodes.push({
            id: basicNode.id,
            level: Number(basicNode.level),
            title,
            type: basicNode.type,
            label: ellipsis(title),
            shape: 'image',
            details: operationDetails,
            schemas: schemas.inputs.length > 0 || schemas.outputs.length > 0 ? schemas : undefined,
        });
    }

    Basic.links.forEach((link) => {
        edges.push({
            from: link.source,
            to: link.target,
        });
    });

    return {nodes, edges};
}

export function updateProgress(
    nodes: DataSet<ProcessedNode>,
    progress: Progress,
    prepare?: (node: ProcessedNode) => ProcessedNode,
    colors?: GraphColors,
    addNew = false,
) {
    const itemsToUpdate: ProcessedNode[] = [];
    for (const nodeId of Object.keys(progress)) {
        let visItem = nodes.get(nodeId);

        if (!visItem && addNew) {
            const node = progress[nodeId];
            const title = `Node #${nodeId}${node.category ? ` (${node.category})` : ''}`;
            visItem = {
                id: nodeId,
                level: 0,
                title,
                label: ellipsis(title ?? ''),
                type: 'op',
            };
        }
        if (visItem) {
            const node = progress[nodeId];
            visItem.progress = node;

            if (node.stages && !isEmpty_(node.stages)) {
                if (isOperationFinished(node.state)) {
                    visItem.label = ellipsis(visItem.title ?? '');
                } else {
                    visItem.label = getLabelWithStage(visItem.title ?? '', node.stages);
                }
            }

            if (typeof prepare === 'function') {
                visItem = prepare(visItem);
            }

            if (colors) {
                visItem.image = drawCircle({type: 'update', node, colors});
                visItem.font = {
                    color: visItem.url ? colors.text.link : colors.text.label,
                };
            }
            itemsToUpdate.push(visItem);
        }
    }
    if (itemsToUpdate.length > 0) {
        if (addNew) {
            nodes.update(itemsToUpdate);
        } else {
            // @ts-ignore
            nodes.updateOnly(itemsToUpdate);
        }
    }
}

export function updateColors(nodes: DataSet<ProcessedNode>, colors: GraphColors) {
    const itemsToUpdate: ProcessedNode[] = [];
    nodes.forEach(
        (node) => {
            if (node.type === 'in' || node.type === 'out') {
                node.image = drawTable(colors);
            } else {
                const detail = node.progress;

                node.font = {
                    color: detail?.remoteId ? colors.text.link : colors.text.label,
                };

                if (detail) {
                    node.image = drawCircle({type: 'update', node: detail, colors});
                } else {
                    node.image = drawCircle({type: 'new', colors});
                }
            }
            itemsToUpdate.push(node);
        },
        {
            filter(item) {
                return Boolean(item.type);
            },
        },
    );
    if (itemsToUpdate.length > 0) {
        nodes.updateOnly(itemsToUpdate);
    }
}

export function prepareNodes(
    nodes: DataSet<ProcessedNode>,
    prepare: (node: ProcessedNode) => ProcessedNode,
) {
    const itemsToUpdate: ProcessedNode[] = [];

    nodes.forEach((node) => {
        itemsToUpdate.push(prepare(node));
    });

    if (itemsToUpdate.length > 0) {
        nodes.updateOnly(itemsToUpdate);
    }
}

export function hasDetailsInfo(details: NodeDetails | undefined) {
    return Boolean(
        details && (details.Streams || details.InputColumns || details.InputKeyFilterColumns),
    );
}

export function hasJobsInfo(progress: NodeProgress | undefined) {
    return (progress?.total ?? 0) > 0;
}

export function hasStagesInfo(progress: NodeProgress | undefined) {
    return !isEmpty_(progress?.stages);
}

export function nodeHasInfo(node: ProcessedNode) {
    const nodeProgress = node.progress;
    if (nodeProgress) {
        if (hasJobsInfo(nodeProgress)) {
            return true;
        }
        if (hasStagesInfo(nodeProgress)) {
            return true;
        }
    }
    return hasDetailsInfo(node.details) || Boolean(node.schemas);
}

export function useOperationNodesStates(nodes: DataSet<ProcessedNode>) {
    const [states, setStates] = React.useState(() => calculateOperationStates(nodes));

    React.useEffect(() => {
        let didUnmount = false;
        const updateState = () => {
            if (!didUnmount) {
                setStates(calculateOperationStates(nodes));
            }
        };
        nodes.on('*', updateState);
        return () => {
            didUnmount = true;
            nodes.off('*', updateState);
        };
    }, [nodes]);

    return states;
}

const states = Object.keys(operationsStateConfig) as NodeState[];
function calculateOperationStates(nodes: DataSet<ProcessedNode>) {
    const counts: Partial<Record<NodeState | 'NotStarted', number>> = {};

    nodes.forEach((node) => {
        if (node.type === 'in' || node.type === 'out') {
            return;
        }
        const state = node.progress?.state || 'NotStarted';
        if (counts[state] === undefined) {
            counts[state] = 0;
        }
        counts[state]! += 1;
    });

    return states.map((state) => {
        return {
            state,
            title: operationsStateConfig[state].title,
            count: counts[state] || 0,
        };
    });
}

export function getFullEdge(
    network: Network,
    nodes: DataSet<ProcessedNode>,
    edge: string | number,
) {
    const connectedNodes = network.getConnectedNodes(edge);
    const hoveredEdges = new Set<string | number>([edge]);
    while (connectedNodes.length > 0) {
        const nodeId = connectedNodes.shift();
        if (typeof nodeId === 'string' && nodes.get(nodeId)?.size === 0) {
            const connectedEdges = network.getConnectedEdges(nodeId);
            for (const e of connectedEdges) {
                if (!hoveredEdges.has(e)) {
                    hoveredEdges.add(e);
                    connectedNodes.push(
                        //@ts-ignore
                        ...network
                            .getConnectedNodes(e)
                            //@ts-ignore
                            .filter((id) => typeof id === 'string' && nodeId !== id),
                    );
                }
            }
        }
    }
    return hoveredEdges;
}

export function getConnectedEdges(
    network: Network,
    nodes: DataSet<ProcessedNode>,
    node: string | number,
) {
    const edges = network.getConnectedEdges(node);
    const connectedEdges = new Set<string | number>();
    for (const edge of edges) {
        const fullEdge = getFullEdge(network, nodes, edge);
        for (const connectedEdge of fullEdge) {
            connectedEdges.add(connectedEdge);
        }
    }
    return connectedEdges;
}

export function drawRunningIcon(progress: NodeProgress | undefined, {operation}: GraphColors) {
    const div = document.createElement('div');
    const colors: string[] = [];
    const dataset: {label: string; count: number}[] = [];

    const {running = 0, completed = 0, total} = progress ?? {};
    const totalR = total || 1;

    const runningPr = Math.round((running / totalR) * 100);
    const completedPr = Math.round((completed / totalR) * 100);
    const leastPr = Math.round(100 - runningPr - completedPr);

    if (completedPr > 0) {
        dataset.push({label: 'Completed', count: completedPr});
        colors.push(operation.completed);
    }

    if (runningPr > 0) {
        dataset.push({label: 'Running', count: runningPr});
        colors.push(operation.running);
    }

    if (leastPr > 0) {
        dataset.push({label: 'Least', count: leastPr});
        colors.push(operation.started);
    }

    const color = scaleOrdinal(colors);

    const width = 80;
    const height = 80;
    const radius = Math.min(width, height) / 2;
    const svg = select(div)
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    const drawArc = arc<(typeof dataset)[number]>()
        .innerRadius(radius - 10)
        .outerRadius(radius);

    const pieData = pie<(typeof dataset)[number]>()
        .value((d) => {
            return d.count;
        })
        .sort(null);

    svg.selectAll('path')
        .data(pieData(dataset))
        .enter()
        .append('path')
        // @ts-ignore
        .attr('d', drawArc)
        .attr('fill', (d) => {
            return color(d.data.label);
        });

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(div.innerHTML);
}

export function handleRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
    return (node: T) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                (ref.current as T) = node;
            }
        });
    };
}

export function escapeStringForRegexp(search: string) {
    return search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
