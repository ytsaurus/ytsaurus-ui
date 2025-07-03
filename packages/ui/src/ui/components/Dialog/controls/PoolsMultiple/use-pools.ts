import {useMemo} from 'react';

import map_ from 'lodash/map';
import forEach_ from 'lodash/forEach';

import ypath from '../../../../common/thor/ypath';

import {useFetchBatchQuery} from '../../../../store/api/yt';

import {YTApiId} from '../../../../rum/rum-wrap-api';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';

export function usePools(trees: string[]) {
    const poolRequests = useMemo(() => {
        return (trees || []).map((tree) => ({
            command: 'list' as const,
            parameters: {
                path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools`,
                ...USE_MAX_SIZE,
                ...USE_CACHE,
            },
        }));
    }, [trees]);

    const {data: allPools, isLoading: isPoolsLoading} = useFetchBatchQuery<string>({
        id: YTApiId.listPools,
        parameters: {
            requests: poolRequests,
        },
        errorTitle: 'Failed to fetch pools list',
    });

    const poolOptionsMap = useMemo(() => {
        const result: Record<string, Array<{value: string; content: string}>> = {};

        if (allPools && allPools.length) {
            forEach_(trees, (tree, index) => {
                if (allPools[index] && allPools[index].output) {
                    result[tree] = map_(ypath.getValue(allPools[index].output), (item) => ({
                        value: item,
                        content: item,
                    }));
                } else {
                    result[tree] = [];
                }
            });
        }

        return result;
    }, [allPools, trees]);

    return {
        isPoolsLoading,
        poolOptionsMap,
    };
}
