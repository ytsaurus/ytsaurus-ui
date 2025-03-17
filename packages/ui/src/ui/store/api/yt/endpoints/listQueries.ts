import {getQueryTrackerRequestOptions} from '../../../../pages/query-tracker/module/query/selectors';
import {getQueryTrackerCluster} from '../../../../config';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';

export type QueriesListParams = {
    is_tutorial?: string;
    user?: string;
    engine?: string;
    filter?: string;
};

export type QueriesListRequestParams = {
    params: QueriesListParams;
    limit?: number;
};

function getQTApiSetup(): {proxy?: string} {
    const QT_CLUSTER = getQueryTrackerCluster();
    if (QT_CLUSTER) {
        const cluster = getClusterConfigByName(QT_CLUSTER);
        if (cluster) {
            return {
                proxy: getClusterProxy(cluster),
            };
        }
    }
    return {};
}

export async function listQueries() {
    //const {stage} = getQueryTrackerRequestOptions(state);
    try {
        const response = ytApiV4Id.listQueries(YTApiId.listQueries, {
            parameters: {
                // stage,
                // ...params,
                // ...cursor,
                // limit,
                output_format: 'json',
            },
            //setup: getQTApiSetup(),
        });
        return {data: response};
    } catch (error) {
        return {error};
    }
}
