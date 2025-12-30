import React from 'react';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import cn from 'bem-cn-lite';

import Graph from './Graph';
import {GraphColorsProvider} from './GraphColors';
import {ProcessedNode} from './utils';

import {Timeline} from './Timeline';
import {LargeGraphInfo} from './LargeGraphInfo';

import './Plan.scss';
import {QueriesGraphLazy} from './GraphEditor';
import {useSelector} from '../../../store/redux-hooks';
import {getSettingsQueryTrackerNewGraphType} from '../../../store/selectors/settings/settings-ts';
import {getProcessedGraph} from '../../../store/selectors/query-tracker/queryPlan';
import type {PlanView} from './PlanActions';

const block = cn('plan');

interface PlanProps {
    planView: PlanView;
    isActive?: boolean;
    className?: string;
    prepareNode?: (node: ProcessedNode) => ProcessedNode;
}

export default React.memo(function Plan({planView, isActive, className, prepareNode}: PlanProps) {
    const graph = useSelector(getProcessedGraph);
    const newGraphType = useSelector(getSettingsQueryTrackerNewGraphType);

    const [showLargeGraph, setShowLargeGraph] = React.useState(false);
    const resultProgressShowMinimap = true; // can be set as user setting in the future

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
                    <Timeline />
                </NotRenderUntilFirstVisible>
            </GraphColorsProvider>
        </div>
    );
});
