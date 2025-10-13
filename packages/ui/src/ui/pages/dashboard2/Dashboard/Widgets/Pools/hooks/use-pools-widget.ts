import {useMemo} from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';

import map_ from 'lodash/map';
import zipObject_ from 'lodash/zipObject';
import includes_ from 'lodash/includes';

import {RootState} from '../../../../../../store/reducers';
import {PoolQueryParams} from '../../../../../../store/api/dashboard2/pools/pools';
import {usePoolsQuery} from '../../../../../../store/api/dashboard2/pools';
import {getFavouritePools} from '../../../../../../store/selectors/favourites';
import {getPoolsTypeFilter} from '../../../../../../store/selectors/dashboard2/pools';

import type {PoolsWidgetProps} from '../types';

const resources = ['cpu', 'memory', 'operations', 'gpu'];

export function usePoolsWidget(props: PoolsWidgetProps) {
    const userPools = props.data?.pools as PoolQueryParams[];
    const resourcesColumns = props.data?.columns as string[];
    const favouritePools = useSelector(getFavouritePools);
    const type = useSelector((state: RootState) => getPoolsTypeFilter(state, props.id));
    const {data, isLoading, isFetching, error} = usePoolsQuery({
        id: props.id,
        type,
        favouriteList: favouritePools,
        customList: userPools,
    });

    const visibleColumns = useMemo(() => {
        return zipObject_(
            resources,
            map_(resources, (resource) => includes_(resourcesColumns, resource)),
        );
    }, [resourcesColumns]);

    return {visibleColumns, data: {pools: data, isLoading: isLoading || isFetching, error}};
}
