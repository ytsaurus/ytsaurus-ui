import * as React from 'react';

import {Button, Text} from '@gravity-ui/uikit';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import {useUpdate} from 'react-use';
import cn from 'bem-cn-lite';
import {DataSet} from 'vis-data';

import Graph from './Graph';
import {GraphColorsProvider} from './GraphColors';
import {usePlanView, useResultPlan, useResultProgress} from './PlanContext';
import {Legend} from './components/Legend/Legend';
import {ProcessedGraph, ProcessedNode, preprocess, updateProgress} from './utils';

import Timeline from './Timeline/Timeline';

import './Plan.scss';
import {GraphWrap} from './GraphEditor/GraphWrap';
import {useSelector} from 'react-redux';
import {getSettingsQueryTrackerNewGraphType} from '../../../store/selectors/settings-ts';

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
                                <GraphWrap graph={graph} />
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
                    The plan of this operation is way too large to be visualized in browser.
                    <br />
                    {`It has ${graph.nodes.length} nodes and ${graph.edges.length} edges.`}
                </Text>
            ) : (
                <Text>
                    {`The operation's plan is quite large, it has ${graph.nodes.length} nodes and ${graph.edges.length} edges.`}
                    <br />
                    It could take a lot of time to draw.
                </Text>
            )}
            <br />
            <Button
                className={block('graph-info-button')}
                onClick={() => {
                    showGraph(true);
                }}
            >
                {enormousGraph
                    ? 'I understand it might freeze my browser, draw the plan anyway'
                    : 'Draw the plan anyway'}
            </Button>
            <Legend nodes={nodes} orientation="vertical" className={block('legend')} />
        </div>
    );
}
