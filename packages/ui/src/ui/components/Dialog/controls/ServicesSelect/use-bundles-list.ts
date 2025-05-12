import {useFetchBatchQuery} from '../../../../store/api/yt';
import {YTApiId} from '../../../../rum/rum-wrap-api';

import {USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';

export function useBunldesList() {
    // @ts-ignore
    const {bundles, isBundlesLoading} = useFetchBatchQuery<string[]>(
        {
            id: YTApiId.listBundles,
            parameters: {
                requests: [
                    {
                        command: 'list' as const,
                        parameters: {
                            path: '//sys/tablet_cell_bundles',
                            ...USE_MAX_SIZE,
                        },
                    },
                ],
            },
            errorTitle: 'Failed to fetch bundles list',
        },
        {
            //@ts-ignore
            // TODO: fix useFetchBatchQuery internal types
            selectFromResult: (state) => ({
                bundles: state?.data && state.data?.length ? state.data[0].output : [],
                isBunldesLoading: state.isLoading,
            }),
        },
    );

    return {bundles, isBundlesLoading} as {bundles?: string[]; isBundlesLoading: boolean};
}
