import {useSelector} from '../../../../../../store/redux-hooks';

import {RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';
import {getNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';
import {getLastVisited} from '../../../../../../store/selectors/settings';
import {getFavouritePaths} from '../../../../../../store/selectors/favourites';

import {NavigationWidgetProps} from '../types';

export function useNavigationWidget(props: NavigationWidgetProps) {
    const type = useSelector((state: RootState) => getNavigationTypeFilter(state, props.id));
    const cluster = useSelector(getCluster);

    const lastVisitedPaths = useSelector(getLastVisited);
    const favouritePaths = useSelector(getFavouritePaths);

    const {
        data: items,
        isLoading,
        isFetching,
        error,
    } = usePathsQuery({id: props.id, cluster, type, lastVisitedPaths, favouritePaths});

    return {
        type,
        items,
        isLoading: isLoading || isFetching,
        error,
    };
}
