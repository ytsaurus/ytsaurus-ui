import {useDispatch, useSelector} from 'react-redux';
import {useCallback} from 'react';
import {applyFilter} from '../../module/queries_list/actions';
import {getQueriesListFilter, getQueriesListMode} from '../../module/queries_list/selectors';
import {QueriesListFilter, QueriesListMode} from '../../module/queries_list/types';

export const useQuriesHistoryFilter = (): [
    QueriesListFilter,
    QueriesListMode,
    <K extends keyof QueriesListFilter>(filter: K, value: QueriesListFilter[K]) => void,
] => {
    const filter = useSelector(getQueriesListFilter);
    const filterPreset = useSelector(getQueriesListMode);
    const dispatch = useDispatch();
    const setFilter = useCallback(
        function setFilter<K extends keyof QueriesListFilter>(
            name: K,
            value: QueriesListFilter[K],
        ) {
            dispatch(
                applyFilter({
                    [name]: value,
                }),
            );
        },
        [dispatch],
    );
    return [filter, filterPreset, setFilter];
};
