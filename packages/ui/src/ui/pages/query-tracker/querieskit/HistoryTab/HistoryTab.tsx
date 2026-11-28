import React, {useCallback, useEffect, useMemo, useState} from 'react';
import block from 'bem-cn-lite';
import debounce_ from 'lodash/debounce';
import {createHistoryFilter} from '@gravity-ui/querieskit/components/HistoryFilter';
import {QueriesHistory} from '@gravity-ui/querieskit/modules/QueriesHistory';
import {type QueryListLinkRenderer} from '@gravity-ui/querieskit';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectHasCustomHistoryFilters,
    selectHasNextPage,
    selectHasQueriesListLoaded,
    selectIsFullTextSearchMode,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectQueriesList,
    selectQueriesListSearchMode,
} from '../../../../store/selectors/query-tracker/queriesList';
import {selectCluster} from '../../../../store/selectors/global';
import {SHARED_QUERY_ACO, selectQuery} from '../../../../store/selectors/query-tracker/query';
import {selectFullTextSearchSupported} from '../../../../store/selectors/query-tracker/queryAco';
import {
    applyFilter,
    loadNextQueriesList,
    requestQueriesList,
} from '../../../../store/actions/query-tracker/queriesList';
import {setSearchMode} from '../../../../store/reducers/query-tracker/queryListSlice';
import {HistoryFilterForm} from '../../QueriesList/QueriesListFilter/HistoryFilterForm/HistoryFilterForm';
import {
    DefaultQueriesListFilter,
    type QueriesListFilter,
    QueriesListMode,
} from '../../../../types/query-tracker/queryList';
import {useUpdater} from '../../../../hooks/use-updater';
import {QUERY_POLLING_INTERVAL} from '../../../../constants/queries';
import {type HistoryItem, prepareHistoryItems} from './adapters';
import {useHistoryVisibleFields} from './useHistoryVisibleFields';
import historyI18n from './i18n';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {setQueryName} from '../../../../store/actions/query-tracker/queryAnnotations';
import editI18n from '../../QueriesList/EditQueryNameModal/i18n';
import tabsI18n from '../../QueriesList/i18n';

import './HistoryTab.scss';

const defaultHistoryFilters: QueriesListFilter = {
    ...DefaultQueriesListFilter[QueriesListMode.History],
    engine: undefined,
    from: undefined,
    to: undefined,
    state: undefined,
};

const b = block('yt-querieskit-history-tab');
const renderLink: QueryListLinkRenderer = ({href = '', ...props}) => (
    <RoutedLink {...props} href={href} disablePreserveLocation />
);

export function HistoryTab() {
    const dispatch = useDispatch();
    const queries = useSelector(selectQueriesList);
    const cluster = useSelector(selectCluster);
    const loading = useSelector(selectIsQueriesListLoading);
    const hasLoaded = useSelector(selectHasQueriesListLoaded);
    const hasMore = useSelector(selectHasNextPage);
    const selectedId = useSelector(selectQuery)?.id;
    const filter = useSelector(selectQueriesFilters);
    const searchMode = useSelector(selectQueriesListSearchMode);
    const fullTextSearch = useSelector(selectIsFullTextSearchMode);
    const fullSearchAvailable = useSelector(selectFullTextSearchSupported);
    const customFilterChanged = useSelector(selectHasCustomHistoryFilters);
    const visibleFields = useHistoryVisibleFields();
    const [editingRowId, setEditingRowId] = useState<HistoryItem['id']>();
    const noNameTitle = historyI18n('field_no-name');

    const update = useCallback(() => {
        dispatch(requestQueriesList(true));
    }, [dispatch]);
    useUpdater(update, {timeout: QUERY_POLLING_INTERVAL});

    const items = useMemo(
        () =>
            prepareHistoryItems({
                queries,
                cluster,
                fullTextSearch,
                filter: filter.filter,
                noNameTitle,
                sharedQueryAco: SHARED_QUERY_ACO,
            }),
        [queries, cluster, fullTextSearch, filter.filter, noNameTitle],
    );

    const updateSearch = useMemo(
        () =>
            debounce_(({value, fullSearch}: {value: string; fullSearch: boolean}) => {
                dispatch(setSearchMode(fullSearch ? 'text' : 'name'));
                dispatch(applyFilter({filter: value}));
            }, 400),
        [dispatch],
    );

    useEffect(() => () => updateSearch.cancel(), [updateSearch]);

    const saveTitle = async (item: HistoryItem, title: string) => {
        try {
            await dispatch(setQueryName(String(item.id), title));
        } catch {
            return;
        }
        setEditingRowId((current) => (current === item.id ? undefined : current));
    };

    return (
        <div className={b({unloaded: !loading && !hasLoaded})}>
            <QueriesHistory<HistoryItem>
                className={b('list')}
                title={tabsI18n('tab_history')}
                filter={createHistoryFilter({
                    initialValues: defaultHistoryFilters,
                    values: {
                        user: filter.user,
                        engine: filter.engine,
                        from: filter.from,
                        to: filter.to,
                        state: filter.state,
                    },
                    isChanged: customFilterChanged || Boolean(filter.engine),
                    renderFields: ({value, onChange}) => (
                        <HistoryFilterForm
                            value={value}
                            onChange={(patch) => onChange({...value, ...patch})}
                            includeQuickFilters
                        />
                    ),
                    onApply: (values) => dispatch(applyFilter(values)),
                    onReset: () => dispatch(applyFilter(defaultHistoryFilters)),
                })}
                search={{
                    value: filter.filter ?? '',
                    fullSearch: searchMode === 'text',
                    fullSearchAvailable,
                    hasClear: true,
                    onUpdate: updateSearch,
                }}
                items={items}
                selectedRowId={selectedId}
                visibleFields={visibleFields}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={() => {
                    if (hasMore && !loading) {
                        dispatch(loadNextQueriesList());
                    }
                }}
                renderLink={renderLink}
                getRowActions={(item) =>
                    item.status === 'running'
                        ? []
                        : [
                              {
                                  text: editI18n('title_edit-query-name'),
                                  onClick: () => setEditingRowId(item.id),
                              },
                          ]
                }
                editing={{
                    rowId: editingRowId,
                    onSubmit: saveTitle,
                    onCancel: () => setEditingRowId(undefined),
                }}
            />
        </div>
    );
}
