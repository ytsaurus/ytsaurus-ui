import React, {FC, useCallback} from 'react';
import Plan from '../Plan/Plan';
import {ProcessedNode} from '../Plan/utils';
import {parseTablePath} from '../Plan/services/tables';
import {genNavigationUrl} from '../../../utils/navigation/navigation';
import {buildOperationUrl} from './helpers/buildOperationUrl';
import {getOperationUrl} from './helpers/getOperationUrl';
import {PlanView} from '../Plan/PlanActions';

type Props = {
    planView: PlanView;
    isActive: boolean;
    operationIdToCluster: Map<string, string>;
};

export const PlanContainer: FC<Props> = ({planView, isActive, operationIdToCluster}) => {
    const handlePrepareNode = useCallback(
        (node: ProcessedNode) => {
            if (node.type === 'in' || node.type === 'out') {
                const table = parseTablePath(node.title ?? '');
                if (table) {
                    node.url = genNavigationUrl({cluster: table.cluster, path: table.path});
                }
                return node;
            }

            if (node.progress?.remoteId) {
                const id = node.progress?.remoteId.split('/').pop();

                if (!id) {
                    node.url = getOperationUrl(node);
                    return node;
                }

                const cluster = operationIdToCluster.has(id)
                    ? operationIdToCluster.get(id)
                    : node.progress?.remoteData?.cluster_name;

                if (cluster) {
                    node.url = buildOperationUrl(cluster, id);
                }
            }

            return node;
        },
        [operationIdToCluster],
    );

    return <Plan planView={planView} isActive={isActive} prepareNode={handlePrepareNode} />;
};
