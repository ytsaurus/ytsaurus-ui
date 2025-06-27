import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {useSelector} from 'react-redux';

import {RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';
import {getNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';

export function useNavigationWidget(props: PluginWidgetProps) {
    const type = useSelector((state: RootState) => getNavigationTypeFilter(state, props.id));
    const cluster = useSelector(getCluster);
    const {data: items, isLoading, isFetching} = usePathsQuery({id: props.id, cluster, type});

    return {
        type,
        items,
        isLoading: isLoading || isFetching,
    };
}
