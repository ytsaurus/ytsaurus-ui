import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {useSelector} from 'react-redux';

import map_ from 'lodash/map';
import zipObject_ from 'lodash/zipObject';
import includes_ from 'lodash/includes';

import {RootState} from '../../../../../../store/reducers';
import {PoolQueryParams} from '../../../../../../store/api/dashboard2/pools/pools';
import {usePoolsQuery} from '../../../../../../store/api/dashboard2/pools';
import {getFavouritePools} from '../../../../../../store/selectors/favourites';
import {getPoolsTypeFilter} from '../../../../../../store/selectors/dashboard2/pools';

const resources = ['cpu', 'memory', 'operations', 'gpu'];

export function usePoolsWidget(props: PluginWidgetProps) {
    const userPools = props.data?.pools as PoolQueryParams[];
    const resourcesColumns = props.data?.columns as string[];
    const favouritePools = useSelector(getFavouritePools);
    const type = useSelector((state: RootState) => getPoolsTypeFilter(state, props.id));
    const {data, isLoading, isFetching, error} = usePoolsQuery({
        type,
        favouriteList: favouritePools,
        customList: userPools,
    });

    const visibleColumns = zipObject_(
        resources,
        map_(resources, (resource) => includes_(resourcesColumns, resource)),
    );

    return {visibleColumns, data: {pools: data, isLoading, isFetching, error}};
}
