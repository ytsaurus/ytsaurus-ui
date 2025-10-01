import {useMemo} from 'react';

import map_ from 'lodash/map';

import {useFetchBatchQuery} from '../../../../store/api/yt';

import {YTApiId} from '../../../../rum/rum-wrap-api';

import {PoolPair} from './PoolsMultiple';
import i18n from './i18n';

export function useTrees(value: PoolPair[]) {
    const {data: trees, isLoading: isTreesLoading} = useFetchBatchQuery<string>({
        id: YTApiId.listPoolsTrees,
        parameters: {
            requests: [
                {
                    command: 'list' as const,
                    parameters: {
                        path: '//sys/scheduler/orchid/scheduler/pool_trees',
                    },
                },
            ],
        },
        errorTitle: i18n('toaster_fetch-failed'),
    });

    const treesLoadedWithData = trees && trees?.length && trees?.[0].output;

    const treesOptions = useMemo(() => {
        return treesLoadedWithData
            ? map_(trees[0].output, (item) => ({
                  value: item,
                  content: item,
              }))
            : [];
    }, [treesLoadedWithData]);

    const uniqueTrees = useMemo(() => {
        if (!value) return [];
        return value.map((pair) => pair.tree).filter((tree) => Boolean(tree));
    }, [value]);

    return {
        trees: uniqueTrees,
        isTreesLoading,
        treesOptions,
    };
}
