import {useSelector} from 'react-redux';

import {RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';
import {getNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';

import {NavigationWidgetProps} from '../types';

export function useNavigationWidget(props: NavigationWidgetProps) {
    const type = useSelector((state: RootState) => getNavigationTypeFilter(state, props.id));
    const cluster = useSelector(getCluster);
    const {
        data: items,
        isLoading,
        isFetching,
        error,
    } = usePathsQuery({id: props.id, cluster, type});

    return {
        type,
        items,
        isLoading: isLoading || isFetching,
        error,
    };
}
