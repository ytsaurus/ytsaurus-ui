import {DEFAULT_UPDATER_TIMEOUT} from '../../../../hooks/use-updater';
import {useSelector} from '../../../../store/redux-hooks';
import {getCluster} from '../../../../store/selectors/global/cluster';
import {getUseAutoRefresh} from '../../../../store/selectors/settings/settings-ts';
import {OverrideDataType} from '../types';
import {ytApi} from '../ytApi';
import {get} from './endpoint';

export const getApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        get: build.query({
            queryFn: get,
            providesTags: (_result, _error, args) => [args.id],
        }),
    }),
});

export function useGetQuery<T>(args: Parameters<typeof get>[0]) {
    const useAutoRefresh = useSelector(getUseAutoRefresh);
    const cluster = useSelector(getCluster);

    const defaultOptions = {
        pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
        skipPollingIfUnfocused: true,
    };

    const customOptions = {
        ...defaultOptions,
    };

    const customArgs =
        'setup' in args
            ? args
            : {
                  ...args,
                  cluster,
              };

    const res = getApi.useGetQuery(customArgs, customOptions);
    return res as OverrideDataType<typeof res, T>;
}
