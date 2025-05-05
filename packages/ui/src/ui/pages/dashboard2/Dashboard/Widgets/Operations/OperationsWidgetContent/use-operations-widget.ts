import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {useOperationsQuery} from '../../../../../../store/api/dashboard2/operations';
import {
    getOperationsStateFilter,
    getOperationsUsersTypeFilter,
} from '../../../../../../store/reducers/dashboard2/operations';
import {getCluster} from '../../../../../../store/selectors/global';

export function useOperationsWidget(props: PluginWidgetProps) {
    const {id, data} = props;
    const cluster = useSelector(getCluster);

    const state = useSelector((state: RootState) => getOperationsStateFilter(state, id));
    const authorType = useSelector((state: RootState) => getOperationsUsersTypeFilter(state, id));

    const authors = data.authors as Array<{value: string; type: string}>;

    const {
        data: operations,
        isLoading,
        isFetching,
        error,
    } = useOperationsQuery({
        cluster,
        authorType,
        state,
        authors,
    });

    return {filters: {state}, data: {operations, isLoading, isFetching, error}};
}
