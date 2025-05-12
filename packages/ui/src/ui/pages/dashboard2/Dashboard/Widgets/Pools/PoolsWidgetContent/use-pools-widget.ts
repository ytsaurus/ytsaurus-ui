import {PluginWidgetProps} from '@gravity-ui/dashkit';

import map_ from 'lodash/map';
import zipObject_ from 'lodash/zipObject';
import includes_ from 'lodash/includes';

import {PoolQueryParams} from '../../../../../../store/api/dashboard2/pools/pools';
import {usePoolsQuery} from '../../../../../../store/api/dashboard2/pools';

const resources = ['cpu', 'memory', 'operations', 'gpu'];

export function usePoolsWidget(props: PluginWidgetProps) {
    const userPools = props.data?.pools as PoolQueryParams[];
    const resourcesColumns = props.data?.columns as string[];
    const {data, isLoading, isFetching, error} = usePoolsQuery({queries: userPools});

    const visibleColumns = zipObject_(
        resources,
        map_(resources, (resource) => includes_(resourcesColumns, resource)),
    );

    return {visibleColumns, data: {pools: data, isLoading, isFetching, error}};
}
