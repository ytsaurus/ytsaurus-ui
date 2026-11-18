import {useNavigationQueryActions} from '../useNavigationQueryActions';
import React, {type FC, useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    NavigationSchemaTab,
    NavigationTable as NavigationTableComponent,
} from '@ytsaurus/components/modules';
import {Loader} from '@gravity-ui/uikit';
import {LoadingPlaceholder} from '../NavigationBody/LoadingPlaceholder';
import {
    selectIsQueryNavigationLoading,
    selectNavigationCluster,
    selectNavigationPath,
    selectNavigationSchemaFilter,
    selectNavigationTable,
    selectPathActionsNode,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {selectPageSize} from '../../../../store/selectors/navigation/content/table-ts';
import {setSchemaFilter} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {selectYsonSettingsDisableDecode} from '../../../../store/selectors/thor/unipika';
import {rumLogError} from '../../../../rum/rum-counter';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import {useExternalSchemaColumns} from './useExternalSchemaColumns';

export const NavigationTable: FC = () => {
    const dispatch = useDispatch();
    const ysonSettings = useSelector(selectYsonSettingsDisableDecode);
    const node = useSelector(selectPathActionsNode);
    const cluster = useSelector(selectNavigationCluster);
    const table = useSelector(selectNavigationTable);
    const limit = useSelector(selectPageSize);
    const path = useSelector(selectNavigationPath);
    const filter = useSelector(selectNavigationSchemaFilter);
    const {insertSelect} = useNavigationQueryActions();

    const loading = useSelector(selectIsQueryNavigationLoading);
    const {columns: additionalSchemaColumns, loading: additionalSchemaLoading} =
        useExternalSchemaColumns(cluster, path);

    const handleFilterChange = useCallback(
        (value: string) => {
            dispatch(setSchemaFilter(value));
        },
        [dispatch],
    );

    if (loading) return <LoadingPlaceholder />;

    return (
        <NavigationTableComponent
            legacyGroupSpacing
            table={table}
            renderSchemaTab={(props) => (
                <>
                    {additionalSchemaLoading && (
                        <div role="status">
                            <Loader size="s" />
                        </div>
                    )}
                    <NavigationSchemaTab {...props} />
                </>
            )}
            filter={filter}
            onFilterChange={handleFilterChange}
            onInsertTableSelect={() => insertSelect(node, limit)}
            ysonSettings={ysonSettings}
            additionalSchemaColumns={additionalSchemaColumns}
            logError={rumLogError}
            ErrorBoundaryComponent={ErrorBoundary}
        />
    );
};
