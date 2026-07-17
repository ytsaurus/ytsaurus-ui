import {DEFAULT_UPDATER_TIMEOUT} from '../../../../hooks/use-updater';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global/cluster';
import {selectUseAutoRefresh} from '../../../../store/selectors/settings/settings-ts';
import {type OverrideDataType} from '../types';
import {ytApi} from '../ytApi';
import {selectRows} from './endpoint';
import {type SelectRowsResponse} from '../../../../../shared/yt-types';

const selectRowsApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        selectRows: build.query({
            queryFn: selectRows,
            providesTags: (_result, _error, args) => [args.id],
        }),
    }),
});

export function useSelectRowsQuery<RowT extends Record<string, unknown>>(
    args: Parameters<typeof selectRows>[0],
) {
    const useAutoRefresh = useSelector(selectUseAutoRefresh);
    const cluster = useSelector(selectCluster);

    const options = {
        pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
        skipPollingIfUnfocused: true,
    };

    const customArgs =
        'setup' in args
            ? args
            : {
                  ...args,
                  cluster,
              };

    const res = selectRowsApi.useSelectRowsQuery(customArgs, options);
    return res as OverrideDataType<typeof res, SelectRowsResponse<RowT>>;
}
