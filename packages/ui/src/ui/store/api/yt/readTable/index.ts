import {DEFAULT_UPDATER_TIMEOUT} from '../../../../hooks/use-updater';
import {useSelector} from '../../../../store/redux-hooks';
import {
    getClusterConfigByName,
    getClusterProxy,
    selectCluster,
} from '../../../../store/selectors/global/cluster';
import {selectUseAutoRefresh} from '../../../../store/selectors/settings/settings-ts';
import {type ReadTableResult} from '../../../actions/navigation/content/table/readTable';
import {type OverrideDataType} from '../types';
import {ytApi} from '../ytApi';
import {readTable} from './endpoint';

const readTableApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        readTable: build.query({
            queryFn: readTable,
            providesTags: (_result, _error, args) => [args.id],
        }),
    }),
});

type ReadTableResponse<RowT extends Record<string, unknown>> = Omit<ReadTableResult, 'rows'> & {
    rows: Array<RowT>;
};

export function useReadTableQuery<RowT extends Record<string, unknown>>({
    ...args
}: Parameters<typeof readTable>[0] & {cluster?: string}) {
    const useAutoRefresh = useSelector(selectUseAutoRefresh);
    const currentCluster = useSelector(selectCluster);

    const options = {
        pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
        skipPollingIfUnfocused: true,
    };

    const {cluster, setup, ...rest} = args;

    const effectiveCluster = cluster ?? currentCluster;
    const effectiveSetup = effectiveCluster
        ? {proxy: getClusterProxy(getClusterConfigByName(effectiveCluster)), ...setup}
        : setup;

    const res = readTableApi.useReadTableQuery({...rest, setup: effectiveSetup}, options);
    return res as OverrideDataType<typeof res, ReadTableResponse<RowT>>;
}
