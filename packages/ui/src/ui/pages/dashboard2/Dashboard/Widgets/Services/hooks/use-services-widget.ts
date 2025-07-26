import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {useServicesQuery} from '../../../../../../store/api/dashboard2/services';
import type {ServicesItem} from '../../../../../../store/api/dashboard2/services/services';

import {RootState} from '../../../../../../store/reducers';
import {getCluster} from '../../../../../../store/selectors/global';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';

export function useServicesWidget(props: PluginWidgetProps) {
    const customItems = props.data?.services as ServicesItem[];

    const cluster = useSelector(getCluster);

    const type = useSelector((state: RootState) => getServicesTypeFilter(state, props.id));

    const {data, isLoading, isFetching, error} = useServicesQuery({
        type,
        id: props.id,
        cluster,
        customItems,
    });

    return {data, isLoading: isLoading || isFetching, error};
}
