import {useContext, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {QueriesPoolingContext} from '../../hooks/QueriesPooling/context';

import {getCurrentQuery} from '../../../../store/selectors/query-tracker/query';
import {getDefaultQueryACO} from '../../../../store/selectors/query-tracker/queryAco';
import {isQueryProgress} from '../../utils/query';
import {QueryItem} from '../../../../types/query-tracker/api';
import {prepareQueryPlanIds} from '../../../../types/query-tracker/query';
import {UPDATE_QUERY_ITEM} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import {updateQueryTabs} from '../../../../store/actions/query-tracker/queryTabs/queryTabs';

export function useCurrentQuery() {
    const query = useSelector(getCurrentQuery);
    const defaultQueryACO = useSelector(getDefaultQueryACO);
    const pollingContext = useContext(QueriesPoolingContext);

    const dispatch = useDispatch();

    const queryUpdateHandler = useMemo(
        () =>
            ([item]: QueryItem[]) => {
                dispatch({
                    type: UPDATE_QUERY_ITEM,
                    data: prepareQueryPlanIds(item, defaultQueryACO),
                });
                dispatch(updateQueryTabs());
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
