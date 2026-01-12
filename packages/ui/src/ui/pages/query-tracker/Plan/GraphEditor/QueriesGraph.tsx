import React, {FC, useState} from 'react';

import {ECameraScaleLevel} from '@gravity-ui/graph';
import {Loader} from '@gravity-ui/uikit';

import {YTGraph, useConfig, useElkLayout, useGraphScale} from '../../../../components/YTGraph';

import {ProcessedGraph} from '../utils';
import {createBlocks} from './helpers/createBlocks';
import {QueriesCanvasBlock, QueriesNodeBlock} from './QueriesNodeBlock';
import {DetailBlock} from './DetailBlock';
import {useSelector} from '../../../../store/redux-hooks';
import {getQuerySingleProgress} from '../../../../store/selectors/query-tracker/query';

type Props = {
    processedGraph: ProcessedGraph;
};

const Graph: FC<Props> = ({processedGraph}) => {
    const {scale, setScale} = useGraphScale();
    const {config, isBlock} = useConfig<QueriesNodeBlock>({
        block: QueriesCanvasBlock,
    });

    const [loading, setLoading] = useState(true);

    const {data, isLoading} = useQueriesGraphData(processedGraph, scale);

    React.useEffect(() => {
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

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

function useQueriesGraphData(progressGraph: ProcessedGraph, scale: ECameraScaleLevel) {
    const {yql_progress: progress} = useSelector(getQuerySingleProgress);

    const data = React.useMemo(() => {
        return createBlocks(progressGraph, progress, scale);
    }, [progressGraph, scale, progress]);

    return useElkLayout(data);
}

function renderPopup(props: {data: QueriesNodeBlock}) {
    return <DetailBlock {...props} />;
}

export default Graph;
