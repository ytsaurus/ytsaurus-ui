import {useSelector, useDispatch} from 'react-redux';
import {useCallback} from 'react';
import {applyFilter} from '../../module/queries_list/actions';
import {QueriesListState} from '../..//module/queries_list/reducer';
import {getQueriesHistoryFilter} from '../..//module/queries_list/selectors';

export const useQuriesHistoryFilter = (): [
    QueriesListState['filter'],
    <K extends keyof QueriesListState['filter']>(
        filter: K,
        value: QueriesListState['filter'][K],
    ) => void,
] => {
    const filter = useSelector(getQueriesHistoryFilter);
    const dispatch = useDispatch();
    const setFilter = useCallback(
        function setFilter<K extends keyof QueriesListState['filter']>(
            name: K,
            value: QueriesListState['filter'][K],
        ) {
            dispatch(
                applyFilter({
                    [name]: value,
                }),
            );
        },
        [dispatch],
    );
    return [filter, setFilter];
};
