import {Page} from '../../../shared/constants/settings';
import {type QueriesListMode} from '../../types/query-tracker/queryList';

type Params = {
    cluster: string;
    queryId?: string;
    listMode?: QueriesListMode;
};

export const makeQueryUrl = ({cluster, queryId, listMode}: Params): string => {
    const pathname = `/${cluster}/${Page.QUERIES}${queryId ? `/${queryId}` : ''}`;
    const searchParams = new URLSearchParams();

    if (listMode) {
        searchParams.set('listMode', listMode);
    }

    return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
};
