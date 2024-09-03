import {useContext, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueriesPoolingContext} from '../../hooks/QueriesPooling/context';

import {getCurrentQuery} from '../../module/query/selectors';
import {getDefaultQueryACO} from '../../module/query_aco/selectors';
import {isQueryProgress} from '../../utils/query';
import {QueryItem} from '../../module/api';
import {prepareQueryPlanIds} from '../../module/query/utills';
import {UPDATE_QUERY} from '../../../../pages/query-tracker/module/query-tracker-contants';

export function useCurrentQuery() {
    const query = useSelector(getCurrentQuery);
    const defaultQueryACO = useSelector(getDefaultQueryACO);
    const pollingContext = useContext(QueriesPoolingContext);

    const dispatch = useDispatch();

    const queryUpdateHandler = useMemo(
        () =>
            ([item]: QueryItem[]) => {
                dispatch({
                    type: UPDATE_QUERY,
                    data: prepareQueryPlanIds(item, defaultQueryACO),
                });
            },
        [dispatch, defaultQueryACO],
    );

    useEffect(
        function pollingEffect() {
            if (!pollingContext || !query || !isQueryProgress(query)) {
                return;
            }
            // eslint-disable-next-line consistent-return
            return pollingContext.watch([query], queryUpdateHandler);
        },
        [pollingContext, query, queryUpdateHandler],
    );

    return query;
}
