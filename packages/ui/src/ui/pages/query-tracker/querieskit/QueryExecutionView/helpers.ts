import type {
    QueryResultTab,
    QueryTab,
} from '../../../../store/reducers/query-tracker/queryTabsSlice';

export function getActiveExecutionTab(
    queryId: string | undefined,
    tabs: QueryTab[],
    selected?: QueryResultTab,
) {
    if (!queryId) return '';
    return tabs.find(({id}) => id === selected)?.id ?? tabs[0]?.id ?? '';
}
