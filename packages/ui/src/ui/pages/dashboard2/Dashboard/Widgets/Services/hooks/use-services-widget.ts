import {useSelector} from 'react-redux';

import {useServicesQuery} from '../../../../../../store/api/dashboard2/services';

import {RootState} from '../../../../../../store/reducers';
import {getCluster} from '../../../../../../store/selectors/global';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';

import type {ServicesWidgetProps} from '../types';

export function useServicesWidget(props: ServicesWidgetProps) {
    const customItems = props.data?.services;

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
