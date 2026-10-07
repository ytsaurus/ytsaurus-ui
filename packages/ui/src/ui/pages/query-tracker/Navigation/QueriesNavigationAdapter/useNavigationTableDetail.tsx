import React, {useMemo} from 'react';
import {
    type NavigationDetailConfig,
    type NavigationDetailTabRenderContext,
    createTableDetailConfig,
} from '@gravity-ui/querieskit';

import {useSelector} from '../../../../store/redux-hooks';
import {
    selectNavigationCluster,
    selectNavigationNodeType,
    selectNavigationPath,
    selectNavigationTable,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {BodyType} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {useExternalSchemaColumns} from '../NavigationTable/useExternalSchemaColumns';
import {NavigationSchemaTab} from './NavigationSchemaTab/NavigationSchemaTab';
import {NavigationPreviewTab} from './NavigationPreviewTab/NavigationPreviewTab';
import {prepareNavigationMeta} from './prepareNavigationMeta';

export function useNavigationTableDetail(): NavigationDetailConfig {
    const table = useSelector(selectNavigationTable);
    const cluster = useSelector(selectNavigationCluster);
    const path = useSelector(selectNavigationPath);
    const nodeType = useSelector(selectNavigationNodeType);
    // Keep loading external columns when the table opens, regardless of its active tab.
    const extraColumns = useExternalSchemaColumns(
        nodeType === BodyType.Table ? cluster : undefined,
        nodeType === BodyType.Table ? path : undefined,
    );
    const meta = useMemo(() => prepareNavigationMeta(table?.meta), [table?.meta]);
    const config = createTableDetailConfig({resolveMeta: () => meta})({
        path,
        title: table?.name ?? path,
    });

    return {
        ...config,
        // YT supplies schema, preview and metadata, but no separate view dataset.
        tabs: config.tabs
            .filter(({id}) => id !== 'view')
            .map((tab) => {
                if (tab.id === 'schema') {
                    return {
                        ...tab,
                        renderContent: ({
                            search,
                            onSearchUpdate,
                            searchPlaceholder,
                        }: NavigationDetailTabRenderContext) => (
                            <NavigationSchemaTab
                                extraColumns={extraColumns}
                                search={search}
                                onSearchUpdate={onSearchUpdate}
                                searchPlaceholder={searchPlaceholder}
                            />
                        ),
                    };
                }
                if (tab.id === 'preview') {
                    return {...tab, renderContent: () => <NavigationPreviewTab />};
                }
                return tab;
            }),
    };
}
