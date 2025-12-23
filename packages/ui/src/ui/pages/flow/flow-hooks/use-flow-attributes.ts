import {YTApiId} from '../../../../shared/constants/yt-api-id';
import {useGetQuery} from '../../../store/api/yt/get';

type FlowAttributes = {
    monitoring_cluster: string;
    monitoring_project: string;
    leader_controller_address: string;
};

export function useFlowAttributes(path: string) {
    return useGetQuery<Partial<FlowAttributes>>({
        id: YTApiId.flowAttributes,
        parameters: {
            path: `${path}/@`,
            attributes: ['monitoring_cluster', 'monitoring_project', 'leader_controller_address'],
        },
    });
}
