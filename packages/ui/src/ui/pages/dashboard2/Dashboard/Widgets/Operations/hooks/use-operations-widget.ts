import {useSelector} from '../../../../../../store/redux-hooks';

import {RootState} from '../../../../../../store/reducers';
import {useOperationsQuery} from '../../../../../../store/api/dashboard2/operations';
import {
    getOperationsAuthorTypeFilter,
    getOperationsStateFilter,
} from '../../../../../../store/selectors/dashboard2/operations';
import {getCluster} from '../../../../../../store/selectors/global';

import {OperationsWidgetProps} from '../types';

export function useOperationsWidget(props: OperationsWidgetProps) {
    const {id, data} = props;
    const cluster = useSelector(getCluster);

    const state = useSelector((state: RootState) => getOperationsStateFilter(state, id));
    const authorType = useSelector((state: RootState) => getOperationsAuthorTypeFilter(state, id));

    const authors = data?.authors;
    const pool = data?.pool;
    const limit = data?.limit?.value || 0;

    const {
        data: queryData,
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

    return {
        filters: {state},
        data: {
            operations: queryData?.operations,
            isLoading: isLoading || isFetching,
            error,
            requestedOperationsErrors: queryData?.requestedOperationsErrors,
        },
    };
}
