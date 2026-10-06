import {type QueryItem} from '../../../../types/query-tracker/api';
import {QueriesListMode} from '../../../../types/query-tracker/queryList';
import {makeQueryUrl} from '../../../../utils/app-url/makeQueryUrl';
import {type TutorialRow} from './types';

const ROW_HEIGHT = 32;

export function prepareTutorialItems({
    queries,
    cluster,
    noNameTitle,
}: {
    queries: QueryItem[];
    cluster: string;
    noNameTitle: string;
}): TutorialRow[] {
    return queries.map((query) => ({
        id: query.id,
        title: query.annotations?.title || noNameTitle,
        href: makeQueryUrl({cluster, queryId: query.id, listMode: QueriesListMode.Tutorials}),
        height: ROW_HEIGHT,
        queryItem: query,
    }));
}

export function filterTutorialItems(items: TutorialRow[], searchValue: string): TutorialRow[] {
    const normalizedSearchValue = searchValue.toLocaleLowerCase();

    if (!normalizedSearchValue) {
        return items;
    }

    return items.filter((item) => item.title.toLocaleLowerCase().includes(normalizedSearchValue));
}
