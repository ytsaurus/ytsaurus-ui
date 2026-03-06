import React, {FC, useCallback, useState} from 'react';
import {Loader} from '@gravity-ui/uikit';
import {YTGraph, useConfig, useGraphScale} from '../../../../components/YTGraph';
import {ProcessedGraph} from '../utils';
import {QueriesCanvasBlock, QueriesNodeBlock} from './QueriesNodeBlock';
import {DetailBlock} from './DetailBlock';
import {useQueriesGraphLayout} from './helpers/useQueriesGraphLayout';
import {QueriesNodeConnection} from './QueriesNodeConnection';
import {PathPopup} from './DetailBlock/PathPopup';
import {OperationType} from './enums';
import {useSelector} from '../../../../store/redux-hooks';
import {getSettingsQueryTrackerGraphAutoCenter} from '../../../../store/selectors/settings/settings-ts';
import {checkControlCommandKey} from '../../../../utils/keyboard';
import {openInNewTab} from '../../../../utils/utils';
import cn from 'bem-cn-lite';
import './QueriesGraph.scss';

const block = cn('yq-queries-graph');

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
    const autoCenter = useSelector(getSettingsQueryTrackerGraphAutoCenter);

    const {data, isLoading} = useQueriesGraphLayout(processedGraph, scale);

    const handleBlockClick = useCallback((node: QueriesNodeBlock, event: Event) => {
        const remoteId = node.meta.nodeProgress?.remoteId;
        if (!remoteId) return;

        const [cluster, operationId] = remoteId.split('/');
        const clusterName = cluster?.split('.')[0] ?? cluster;
        const url = `/${clusterName}/operations/${encodeURIComponent(operationId ?? '')}`;

        if (checkControlCommandKey(event as MouseEvent)) {
            openInNewTab(url);
        } else {
            window.location.href = url;
        }
    }, []);

    React.useEffect(() => {
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

    return loading ? (
        <Loader />
    ) : (
        <YTGraph
            className={block()}
            isBlock={isBlock}
            config={config}
            setScale={setScale}
            renderPopup={renderPopup}
            toolbox
            zoomOnScroll
            autoCenter={autoCenter}
            highlightConnectionsOnHover
            onBlockClick={handleBlockClick}
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
