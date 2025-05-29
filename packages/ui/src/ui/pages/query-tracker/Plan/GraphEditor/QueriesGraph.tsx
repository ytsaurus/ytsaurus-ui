import React, {FC, useEffect, useMemo, useState} from 'react';

import {ECameraScaleLevel, useElk} from '@gravity-ui/graph';
import {Loader} from '@gravity-ui/uikit';

import {useConfig, getElkConfig} from '../../../../components/YTGraph';
import {YTGraph} from '../../../../components/YTGraph';

import {ProcessedGraph} from '../utils';
import {useResultProgress} from '../PlanContext';
import {createBlocks} from './helpers/createBlocks';
import {getNodesAndAges} from './helpers/getNodesAndAges';
import {QueriesNodeBlock} from './QueriesNodeBlock';
import {DetailBlock} from './DetailBlock';
import {Logger} from '../../../../utils/logger';
import {useMemoizedIfEqual} from '../../../../hooks/use-updater';

const BLOCK_SIDE = 100;

const blockSize = {height: BLOCK_SIDE, width: BLOCK_SIDE};

type Props = {
    processedGraph: ProcessedGraph;
};

const logger = new Logger('QuereisGraph');

const Graph: FC<Props> = ({processedGraph}) => {
    const {config, isBlock} = useConfig<QueriesNodeBlock>();

    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState<ECameraScaleLevel>(ECameraScaleLevel.Schematic);
    const progress = useResultProgress();

    const elkConfig = useMemo(() => {
        const {children, edges} = getNodesAndAges(processedGraph);
        return getElkConfig(children, edges, blockSize);
    }, [processedGraph]);

    const [positions] = useMemoizedIfEqual(useElk(elkConfig));

    const [data, setData] = React.useState<any>();

    useEffect(() => {
        if (positions.isLoading || !positions.result) return;

        createBlocks(processedGraph, progress, positions.result, scale, blockSize).then(
            ({blocks, connections}) => {
                setData({blocks, connections});
                setLoading(false);
            },
        );
    }, [positions, processedGraph, progress, scale]);

    logger.diff('createBlocks', {
        config,
        processedGraph,
        elkConfig,
        positions,
        data,
        progress,
        scale,
    });

    return loading ? (
        <Loader />
    ) : (
        <YTGraph
            isBlock={isBlock}
            config={config}
            setScale={setScale}
            renderPopup={renderPopup}
            data={data}
        />
    );
};

function renderPopup(props: {data: QueriesNodeBlock}) {
    return <DetailBlock {...props} />;
}

export default Graph;
