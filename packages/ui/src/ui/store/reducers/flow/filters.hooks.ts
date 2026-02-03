import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {filtersSlice} from './filters';

export function useFlowComputationsNameFilter() {
    const dispatch = useDispatch();
    const computationsNameFilter = useSelector(
        (state) => state.flow.filters.computationsNameFilter,
    );

    return {
        computationsNameFilter,
        setComputationsNameFilter: (value: string) => {
            dispatch(filtersSlice.actions.updateFlowFilters({computationsNameFilter: value}));
        },
    };
}

export function useFlowWorkersNameFilter() {
    const dispatch = useDispatch();
    const workdersNameFilter = useSelector((state) => state.flow.filters.workersNameFilter);

    return {
        workdersNameFilter,
        setWorkersNameFilter: (value: string) => {
            dispatch(filtersSlice.actions.updateFlowFilters({workersNameFilter: value}));
        },
    };
}

export function useFlowPartitionIdFilter() {
    const dispatch = useDispatch();
    const partitionIdFilter = useSelector((state) => state.flow.filters.partitionIdFilter);

    return {
        partitionIdFilter,
        setPartitionIdFilter: (value: string) => {
            dispatch(filtersSlice.actions.updateFlowFilters({partitionIdFilter: value}));
        },
    };
}
