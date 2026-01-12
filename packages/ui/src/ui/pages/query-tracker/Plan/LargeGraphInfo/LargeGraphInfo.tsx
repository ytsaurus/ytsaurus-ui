import React from 'react';
import {ProcessedGraph, ProcessedNode, updateProgress} from '../utils';
import {useSelector} from '../../../../store/redux-hooks';
import {DataSet} from 'vis-data';
import {useUpdate} from 'react-use';
import {Button, Text} from '@gravity-ui/uikit';
import {Legend} from '../components/Legend/Legend';
import cn from 'bem-cn-lite';
import './LargeGraphInfo.scss';
import {getQuerySingleProgress} from '../../../../store/selectors/query-tracker/query';
import i18n from './i18n';

const block = cn('yt-large-graph-info');

export function LargeGraphInfo({
    showGraph,
    graph,
}: {
    showGraph: React.Dispatch<React.SetStateAction<boolean>>;
    graph: ProcessedGraph;
}) {
    const {yql_progress: progress} = useSelector(getQuerySingleProgress);
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
    }, [graph, repaint]);

    React.useEffect(() => {
        if (progress) {
            updateProgress(nodes, progress);
            repaint();
        }
    }, [progress, repaint]);

    const enormousGraph = graph.nodes.length > 700 || graph.edges.length > 3000;
    return (
        <div className={block()}>
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
