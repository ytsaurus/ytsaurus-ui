import {YQLSstatistics} from '../../../../types/query-tracker/api';

export const extractOperationIdToCluster = (
    statistics: YQLSstatistics | undefined,
): Map<string, string> => {
    const clusterNames: Map<string, string> = new Map();

    if (!statistics) return clusterNames;

    const traverse = (obj: YQLSstatistics) => {
        for (const key in obj) {
            if (key === '_cluster_name') {
                clusterNames.set(obj._id, obj._cluster_name);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                traverse(obj[key]);
            }
        }
    };

    traverse(statistics);

    return clusterNames;
};
