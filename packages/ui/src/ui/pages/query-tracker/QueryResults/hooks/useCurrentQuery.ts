import {useContext, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {QueriesPoolingContext} from '../../hooks/QueriesPooling/context';
import {UPDATE_QUERY} from '../../module/query/actions';
import {getCurrentQuery} from '../../module/query/selectors';
import {isQueryProgress} from '../../utils/query';

export function useCurrentQuery() {
    const query = useSelector(getCurrentQuery);
    const pollingContext = useContext(QueriesPoolingContext);

    const dispatch = useDispatch();

    useEffect(
        function pollingEffect() {
            if (!pollingContext || !query || !isQueryProgress(query)) {
                return;
            }
            // eslint-disable-next-line consistent-return
            return pollingContext.watch([query], ([item]) => {
                dispatch({
                    type: UPDATE_QUERY,
                    data: item,
                });
            });
        },
        [pollingContext, dispatch, query?.id, query?.state],
    );

    return query;
}
