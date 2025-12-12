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
