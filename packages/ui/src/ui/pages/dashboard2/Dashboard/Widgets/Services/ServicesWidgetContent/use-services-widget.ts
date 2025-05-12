import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {useServicesQuery} from '../../../../../../store/api/dashboard2/services';
import type {ServicesItem} from '../../../../../../store/api/dashboard2/services/services';

import {getCluster} from '../../../../../../store/selectors/global';

export function useServicesWidget(props: PluginWidgetProps) {
    const items = props.data?.services as ServicesItem[];

    const cluster = useSelector(getCluster);

    const {data, isLoading, error} = useServicesQuery({cluster, items});

    return {data, isLoading, error};
}
