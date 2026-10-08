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
    selectNavigationClusterConfig,
    selectNavigationPath,
    selectNavigationSchemaFilter,
    selectNavigationTable,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {selectPageSize} from '../../../../store/selectors/navigation/content/table-ts';
import {setSchemaFilter} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {selectYsonSettingsDisableDecode} from '../../../../store/selectors/thor/unipika';
import {useMonaco} from '../../hooks/useMonaco';
import {createTableSelect} from '../helpers/createTableSelect';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {rumLogError} from '../../../../rum/rum-counter';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import {useExternalSchemaColumns} from './useExternalSchemaColumns';

export const NavigationTable: FC = () => {
    const dispatch = useDispatch();
    const ysonSettings = useSelector(selectYsonSettingsDisableDecode);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const cluster = useSelector(selectNavigationCluster);
    const table = useSelector(selectNavigationTable);
    const engine = useSelector(selectQueryEngine);
    const limit = useSelector(selectPageSize);
    const path = useSelector(selectNavigationPath);
    const filter = useSelector(selectNavigationSchemaFilter);
    const {getEditor} = useMonaco();

    const loading = useSelector(selectIsQueryNavigationLoading);
    const {columns: additionalSchemaColumns, loading: additionalSchemaLoading} =
        useExternalSchemaColumns(cluster, path);

    const handleInsertTableSelect = useCallback(async () => {
        if (!clusterConfig) return;
        const editor = getEditor('queryEditor');
        const text = await createTableSelect({clusterConfig, path, engine, limit});
        insertTextWhereCursor(text, editor);
    }, [clusterConfig, path, engine, limit, getEditor]);

    const handleFilterChange = useCallback(
        (value: string) => {
            dispatch(setSchemaFilter(value));
        },
        [dispatch],
    );

    if (loading) return <LoadingPlaceholder />;

    return (
        <NavigationTableComponent
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
            onInsertTableSelect={handleInsertTableSelect}
            ysonSettings={ysonSettings}
            additionalSchemaColumns={additionalSchemaColumns}
            logError={rumLogError}
            ErrorBoundaryComponent={ErrorBoundary}
        />
    );
};
