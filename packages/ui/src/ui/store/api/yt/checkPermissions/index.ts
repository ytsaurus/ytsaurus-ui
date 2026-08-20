import {DEFAULT_UPDATER_TIMEOUT} from '../../../../hooks/use-updater';
import {useSelector} from '../../../../store/redux-hooks';
import {selectUseAutoRefresh} from '../../../../store/selectors/settings/settings-ts';
import {type OverrideDataType} from '../types';
import {useEffectiveClusterArgs} from '../utils';
import {ytApi} from '../ytApi';
import {type Params, checkPermission} from './endpoint';

const checkPermissionApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        checkPermissions: build.query({
            queryFn: checkPermission,
            providesTags: (_result, _error, params) => [params.id],
        }),
    }),
});

export function useCheckPermissionQuery(params: Params) {
    const useAutoRefresh = useSelector(selectUseAutoRefresh);

    const options = {
        pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
        skipPollingIfUnfocused: true,
    };

    const effectiveParams = useEffectiveClusterArgs(params);

    const res = checkPermissionApi.useCheckPermissionsQuery(effectiveParams, options);
    return res as OverrideDataType<typeof res, (typeof res)['data']>;
}
