import {useSelector} from '../../../../../../store/redux-hooks';

import {useServicesQuery} from '../../../../../../store/api/dashboard2/services';

import {RootState} from '../../../../../../store/reducers';
import {getCluster} from '../../../../../../store/selectors/global';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';
import {getFavouriteBundles, getFavouriteChyt} from '../../../../../../store/selectors/favourites';

import type {ServicesWidgetProps} from '../types';

export function useServicesWidget(props: ServicesWidgetProps) {
    const customItems = props.data?.services;

    const cluster = useSelector(getCluster);

    const type = useSelector((state: RootState) => getServicesTypeFilter(state, props.id));

    const favouriteBundles = useSelector(getFavouriteBundles);
    const favouriteCliques = useSelector(getFavouriteChyt);

    const {data, isLoading, isFetching, error} = useServicesQuery({
        type,
        id: props.id,
        cluster,
        customItems,
        favouriteBundles,
        favouriteCliques,
    });

    return {data, isLoading: isLoading || isFetching, error};
}
