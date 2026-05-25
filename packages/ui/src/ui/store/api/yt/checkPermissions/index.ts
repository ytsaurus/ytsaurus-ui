import {DEFAULT_UPDATER_TIMEOUT} from '../../../../hooks/use-updater';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global/cluster';
import {getUseAutoRefresh} from '../../../../store/selectors/settings/settings-ts';
import {type OverrideDataType} from '../types';
import {ytApi} from '../ytApi';
import {type CheckPermissionParams, checkPermission} from './endpoint';

const checkPermissionApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        checkPermissions: build.query({
            queryFn: checkPermission,
            providesTags: (_result, _error, params) => [params.id],
        }),
    }),
});

export function useCheckPermissionQuery(params: CheckPermissionParams) {
    const useAutoRefresh = useSelector(getUseAutoRefresh);
    const cluster = useSelector(selectCluster);

    const options = {
        pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
        skipPollingIfUnfocused: true,
    };

    const customParams =
        'setup' in params
            ? params
            : {
                  ...params,
                  cluster,
              };

    const res = checkPermissionApi.useCheckPermissionsQuery(customParams, options);
    return res as OverrideDataType<typeof res, (typeof res)['data']>;
}
