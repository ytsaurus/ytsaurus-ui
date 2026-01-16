import React, {FC, useState} from 'react';
import {Loader} from '@gravity-ui/uikit';
import {YTGraph, useConfig, useGraphScale} from '../../../../components/YTGraph';
import {ProcessedGraph} from '../utils';
import {QueriesCanvasBlock, QueriesNodeBlock} from './QueriesNodeBlock';
import {DetailBlock} from './DetailBlock';
import {useQueriesGraphLayout} from './helpers/useQueriesGraphLayout';
import {QueriesNodeConnection} from './QueriesNodeConnection';
import {PathPopup} from './DetailBlock/PathPopup';
import {OperationType} from './enums';

type Props = {
    processedGraph: ProcessedGraph;
};

const Graph: FC<Props> = ({processedGraph}) => {
    const {scale, setScale} = useGraphScale();
    const {config, isBlock} = useConfig<QueriesNodeBlock>(
        {
            block: QueriesCanvasBlock,
        },
        {connection: QueriesNodeConnection},
    );

    const [loading, setLoading] = useState(true);

    const {data, isLoading} = useQueriesGraphLayout(processedGraph, scale);

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
            toolbox
            zoomOnScroll
            data={data}
        />
    );
};

function renderPopup(props: {data: QueriesNodeBlock}) {
    const type = props.data.meta.operationType;

    if (type === OperationType.Table) {
        return <PathPopup tablePath={props.data.meta.tablePath} />;
    }

    if (type === OperationType.Read) {
        return null;
    }

    return <DetailBlock {...props} />;
}

export default Graph;
