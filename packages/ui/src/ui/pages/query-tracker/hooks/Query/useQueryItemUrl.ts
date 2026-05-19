import type {QueryItem} from '../../../../types/query-tracker/api';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global';
import {selectQueriesListMode} from '../../../../store/selectors/query-tracker/queriesList';
import {makeQueryUrl} from '../../../../utils/app-url';

export function useQueryItemUrl(item: QueryItem): string {
    const cluster = useSelector(selectCluster);
    const listMode = useSelector(selectQueriesListMode);

    return makeQueryUrl({cluster, queryId: item.id, listMode});
}
