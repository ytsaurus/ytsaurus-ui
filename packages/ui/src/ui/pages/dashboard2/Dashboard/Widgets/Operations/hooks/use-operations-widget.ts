import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {useOperationsQuery} from '../../../../../../store/api/dashboard2/operations';
import {
    getOperationsAuthorTypeFilter,
    getOperationsStateFilter,
} from '../../../../../../store/selectors/dashboard2/operations';
import {getCluster} from '../../../../../../store/selectors/global';

export type Author = {
    value: string;
    type: 'users';
};

export function useOperationsWidget(props: PluginWidgetProps) {
    const {id, data} = props;
    const cluster = useSelector(getCluster);

    const state = useSelector((state: RootState) => getOperationsStateFilter(state, id));
    const authorType = useSelector((state: RootState) => getOperationsAuthorTypeFilter(state, id));

    const authors = data.authors as Array<Author>;
    const pool = data.pool as string;
    const limit = (data?.limit as {value?: number})?.value || 0;

    const {
        data: operations,
        isLoading,
        isFetching,
        error,
    } = useOperationsQuery({
        id,
        cluster,
        authorType,
        state,
        authors,
        pool,
        limit,
    });

    return {filters: {state}, data: {operations, isLoading: isLoading || isFetching, error}};
}
