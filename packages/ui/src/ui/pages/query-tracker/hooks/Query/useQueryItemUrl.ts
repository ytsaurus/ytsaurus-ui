import type {QueryItem} from '../../../../types/query-tracker/api';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global';
import {selectQueriesListMode} from '../../../../store/selectors/query-tracker/queriesList';
import {useHistory} from 'react-router';
import {useCallback} from 'react';
import {buildQueryItemUrl} from './buildQueryItemUrl';

export function useQueryItemUrl(): (item: QueryItem) => string {
    const cluster = useSelector(selectCluster);
    const listMode = useSelector(selectQueriesListMode);
    const history = useHistory();

    return useCallback(
        (item: QueryItem) => buildQueryItemUrl(cluster, item.id, listMode, history.location.search),
        [cluster, history.location.search, listMode],
    );
}
