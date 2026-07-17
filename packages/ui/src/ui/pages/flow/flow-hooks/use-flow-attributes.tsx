import React from 'react';
import {YTApiId} from '../../../../shared/constants/yt-api-id';
import ypath from '../../../common/thor/ypath';
import {YTErrorInline} from '../../../containers/YTErrorInline/YTErrorInline';
import {useGetQuery} from '../../../store/api/yt/get';
import {useSelectRowsQuery} from '../../../store/api/yt/selectRows';
import {Query} from '../../../utils/navigation/content/table/query';

type FlowAttributes = {
    monitoring_cluster: string;
    monitoring_project: string;
    leader_controller_address: string;
    pipeline_name?: string;
};

export function useFlowAttributes(path: string) {
    return useGetQuery<Partial<FlowAttributes>>({
        id: YTApiId.flowAttributes,
        parameters: {
            path: `${path}/@`,
            attributes: [
                'monitoring_cluster',
                'monitoring_project',
                'leader_controller_address',
                'pipeline_name',
            ],
        },
    });
}

export function useFlowLeaderControllerName(path: string) {
    const {data, error} = useSelectRowsQuery({
        id: YTApiId.flowLeaderControllerName,
        parameters: {
            query: Query.prepareQueryByKeys({
                path,
                columns: [],
                keyValues: {
                    key: 'leader_controller',
                },
                limit: 2,
            }),
            output_format: 'web_json' as const,
        },
    });

    return {
        errorContent: error ? <YTErrorInline error={error} /> : undefined,
        data: ypath.getValue(data?.rows?.[0], '/value/name'),
    };
}
