import {useCallback} from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import {useHistory} from 'react-router';
import {createQueryUrl} from '../../utils/navigation';
import {QueryItem} from '../../../../types/query-tracker/api';
import {getCluster} from '../../../../store/selectors/global';
import {getQuery} from '../../../../store/selectors/query-tracker/query';
import {getQueriesListMode} from '../../../../store/selectors/query-tracker/queriesList';

export const useQueryNavigation = (): [QueryItem['id'] | undefined, (id: QueryItem) => void] => {
    const selectedItem = useSelector(getQuery);
    const cluster = useSelector(getCluster);
    const listMode = useSelector(getQueriesListMode);
    const history = useHistory();

    const goToQuery = useCallback(
        (item: QueryItem) => {
            const url = createQueryUrl(cluster, item.id);
            const searchParams = new URLSearchParams(history.location.search);
            searchParams.set('listMode', listMode);
            history.push(`${url}?${searchParams.toString()}`);
        },
        [cluster, history, listMode],
    );

    return [selectedItem?.id, goToQuery];
};
