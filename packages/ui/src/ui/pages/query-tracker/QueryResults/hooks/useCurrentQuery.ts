import {useContext, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {QueriesPoolingContext} from '../../hooks/QueriesPooling/context';

import {getCurrentQuery} from '../../../../store/selectors/queries/query';
import {getDefaultQueryACO} from '../../../../store/selectors/queries/queryAco';
import {isQueryProgress} from '../../utils/query';
import {QueryItem} from '../../../../store/actions/queries/api';
import {prepareQueryPlanIds} from '../../../../types/query-tracker/query';
import {UPDATE_QUERY_ITEM} from '../../../../store/reducers/queries/query-tracker-contants';
import {updateQueryTabs} from '../../../../store/actions/queries/queryTabs/queryTabs';

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
