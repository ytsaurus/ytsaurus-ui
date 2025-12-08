import * as React from 'react';

import {Button, Text} from '@gravity-ui/uikit';
import NotRenderUntilFirstVisible from '../../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import {useUpdate} from 'react-use';
import cn from 'bem-cn-lite';
import {DataSet} from 'vis-data';

import Graph from '../Graph';
import {GraphColorsProvider} from '../GraphColors';
import {usePlanView, useResultPlan, useResultProgress} from '../PlanContext';
import {Legend} from '../components/Legend/Legend';
import {ProcessedGraph, ProcessedNode, preprocess, updateProgress} from '../utils';

import Timeline from '../Timeline/Timeline';

import '../Plan.scss';
import {QueriesGraphLazy} from '../GraphEditor';
import {useSelector} from '../../../../store/redux-hooks';
import {getSettingsQueryTrackerNewGraphType} from '../../../../store/selectors/settings/settings-ts';
import i18n from './i18n';

const block = cn('plan');

interface PlanProps {
    isActive?: boolean;
    className?: string;
    prepareNode?: (node: ProcessedNode) => ProcessedNode;
}

export default React.memo(function Plan({isActive, className, prepareNode}: PlanProps) {
    const plan = useResultPlan();
    const [showLargeGraph, setShowLargeGraph] = React.useState(false);
    const planView = usePlanView();
    const resultProgressShowMinimap = true; // can be setted as user setting on future
    const newGraphType = useSelector(getSettingsQueryTrackerNewGraphType);

    const graph = React.useMemo(() => (plan ? preprocess(plan) : undefined), [plan]);

    if (!graph) {
        return null;
    }

    const isLargeGraph = graph.nodes.length > 250;
    return (
        <div className={block(null, className)}>
            <GraphColorsProvider>
                <NotRenderUntilFirstVisible hide={planView !== 'graph'} className={block('graph')}>
                    {isLargeGraph && !showLargeGraph ? (
                        <LargeGraphInfo showGraph={setShowLargeGraph} graph={graph} />
                    ) : (
                        <>
                            {newGraphType ? (
                                <QueriesGraphLazy
                                    key={planView === 'graph' ? 'visible' : 'hidden'}
                                    processedGraph={graph}
                                />
                            ) : (
                                <Graph
                                    isActive={isActive && planView === 'graph'}
                                    graph={graph}
                                    showMinimap={resultProgressShowMinimap}
                                    prepareNode={prepareNode}
                                />
                            )}
                        </>
                    )}
                </NotRenderUntilFirstVisible>
                <NotRenderUntilFirstVisible
                    hide={planView !== 'timeline'}
                    className={block('table')}
                >
                    <Timeline graph={graph} prepareNode={prepareNode} />
                </NotRenderUntilFirstVisible>
            </GraphColorsProvider>
        </div>
    );
});

function LargeGraphInfo({
    showGraph,
    graph,
}: {
    showGraph: React.Dispatch<React.SetStateAction<boolean>>;
    graph: ProcessedGraph;
}) {
    const progress = useResultProgress();
    const [nodes] = React.useState(() => new DataSet<ProcessedNode>());
    const repaint = useUpdate();

    const progressRef = React.useRef(progress);
    progressRef.current = progress;

    React.useEffect(() => {
        nodes.clear();
        nodes.add(graph.nodes);
        if (progressRef.current) {
            updateProgress(nodes, progressRef.current);
        }
        repaint();
    }, [nodes, graph, repaint]);

    React.useEffect(() => {
        if (progress) {
            updateProgress(nodes, progress);
            repaint();
        }
    }, [nodes, progress, repaint]);

    const enormousGraph = graph.nodes.length > 700 || graph.edges.length > 3000;
    return (
        <div className={block('graph-info')}>
            {enormousGraph ? (
                <Text>
                    {i18n('context_plan-too-large')}
                    <br />
                    {i18n('context_plan-nodes-edges', {
                        nodes: String(graph.nodes.length),
                        edges: String(graph.edges.length),
                    })}
                </Text>
            ) : (
                <Text>
                    {i18n('context_plan-large', {
                        nodes: String(graph.nodes.length),
                        edges: String(graph.edges.length),
                    })}
                    <br />
                    {i18n('context_plan-large-time')}
                </Text>
            )}
            <br />
            <Button
                className={block('graph-info-button')}
                onClick={() => {
                    showGraph(true);
                }}
            >
                {enormousGraph ? i18n('action_draw-plan-freeze') : i18n('action_draw-plan')}
            </Button>
            <Legend nodes={nodes} orientation="vertical" className={block('legend')} />
        </div>
    );
}
