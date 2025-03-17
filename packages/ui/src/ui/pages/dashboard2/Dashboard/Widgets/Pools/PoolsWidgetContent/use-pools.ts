import {useSelector} from 'react-redux';

import map_ from 'lodash/map';

import ypath from '../../../../../../common/thor/ypath';

import {useFetchBatchQuery} from '../../../../../../store/api/yt';
import {getFavouritePools} from '../../../../../../store/selectors/favourites';
import {YTApiId} from '../../../../../../../shared/constants/yt-api-id';

export function usePools() {
    const favouritePools = useSelector(getFavouritePools);

    const {data, isLoading} = useFetchBatchQuery({
        parameters: {
            requests: map_(favouritePools, ({path}) => {
                const pool = path.split('[')[0];
                const tree = path.split('[')[1]?.split(']')[0] || '';
                return {
                    command: 'get' as const,
                    parameters: {
                        path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${pool}`,
                    },
                };
            }),
        },
        id: YTApiId.poolsInfo,
    });

    const pools = map_(data, (item) => {
        if (item.error) return;
        if (item.output) {
            const {output} = item;

            const name = ypath.getValue(output, '/full_path').substring(1);

            const operationsGarantee = ypath.getValue(output, '/max_operation_count');
            const operationsUsage = ypath.getValue(output, '/running_operation_count');

            const garantee = ypath.getValue(output, '/estimated_guarantee_resources');
            const usage = ypath.getValue(output, '/resource_usage');

            const cpu = {
                value: (ypath.getValue(usage, '/cpu') / ypath.getValue(garantee, '/cpu')) * 50,
                garantee: ypath.getValue(garantee, '/cpu'),
                usage: ypath.getValue(usage, '/cpu'),
            };

            const memory = {
                value:
                    (ypath.getValue(usage, '/user_memory') /
                        ypath.getValue(garantee, '/user_memory')) *
                    50,
                garantee: ypath.getValue(garantee, '/user_memory'),
                usage: ypath.getValue(usage, '/user_memory'),
            };

            const gpu = {
                value: (ypath.getValue(usage, '/gpu') / ypath.getValue(garantee, '/gpu')) * 50,
                garantee: ypath.getValue(garantee, '/gpu'),
                usage: ypath.getValue(usage, '/gpu'),
            };

            const operations = {
                value: (operationsUsage / operationsGarantee) * 50,
                garantee: operationsGarantee,
                usage: operationsUsage,
            };

            return {name, cpu, gpu, memory, operations};
        }
    });

    return {pools, isLoading};
}
