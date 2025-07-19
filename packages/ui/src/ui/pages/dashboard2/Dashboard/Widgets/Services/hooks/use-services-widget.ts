import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {useServicesQuery} from '../../../../../../store/api/dashboard2/services';
import type {ServicesItem} from '../../../../../../store/api/dashboard2/services/services';

import {RootState} from '../../../../../../store/reducers';
import {getCluster} from '../../../../../../store/selectors/global';
import {getFavouriteBundles, getFavouriteChyt} from '../../../../../../store/selectors/favourites';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';

export function useServicesWidget(props: PluginWidgetProps) {
    const customItems = props.data?.services as ServicesItem[];

    const cluster = useSelector(getCluster);
    const favouriteCliques = useSelector(getFavouriteChyt);
    const favouriteBundles = useSelector(getFavouriteBundles);

    const type = useSelector((state: RootState) => getServicesTypeFilter(state, props.id));

    let items = [];
    if (type === 'favourite') {
        items = [
            ...favouriteCliques.map((clique) => ({service: 'chyt', item: clique.path})),
            ...favouriteBundles.map((bundle) => ({service: 'bundle', item: bundle.path})),
        ];
    } else {
        items = customItems;
    }

    const {data, isLoading, isFetching, error} = useServicesQuery({id: props.id, cluster, items});

    return {data, isLoading: isLoading || isFetching, error};
}
