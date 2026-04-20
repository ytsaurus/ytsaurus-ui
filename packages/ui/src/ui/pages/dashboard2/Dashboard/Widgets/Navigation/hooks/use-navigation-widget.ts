import {useSelector} from '../../../../../../store/redux-hooks';

import {type RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {selectCluster} from '../../../../../../store/selectors/global';
import {selectNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';
import {getLastVisited} from '../../../../../../store/selectors/settings';
import {selectFavouritePaths} from '../../../../../../store/selectors/favourites';

import {type NavigationWidgetProps} from '../types';

export function useNavigationWidget(props: NavigationWidgetProps) {
    const type = useSelector((state: RootState) => selectNavigationTypeFilter(state, props.id));
    const cluster = useSelector(selectCluster);

    const lastVisitedPaths = useSelector(getLastVisited);
    const favouritePaths = useSelector(selectFavouritePaths);

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
