import {useSelector} from '../../../../../../store/redux-hooks';

import {RootState} from '../../../../../../store/reducers';
import {useOperationsQuery} from '../../../../../../store/api/dashboard2/operations';
import {
    selectOperationsAuthorTypeFilter,
    selectOperationsStateFilter,
} from '../../../../../../store/selectors/dashboard2/operations';
import {selectCluster} from '../../../../../../store/selectors/global';

import {OperationsWidgetProps} from '../types';

export function useOperationsWidget(props: OperationsWidgetProps) {
    const {id, data} = props;
    const cluster = useSelector(selectCluster);

    const state = useSelector((state: RootState) => selectOperationsStateFilter(state, id));
    const authorType = useSelector((state: RootState) => selectOperationsAuthorTypeFilter(state, id));

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
