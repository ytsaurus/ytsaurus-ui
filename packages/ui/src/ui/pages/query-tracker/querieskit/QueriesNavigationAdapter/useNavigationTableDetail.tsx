import React from 'react';
import {MetaTable} from '@ytsaurus/components';
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
import {useExternalSchemaColumns} from '../../Navigation/NavigationTable/useExternalSchemaColumns';
import {NavigationSchemaTab} from './NavigationSchemaTab/NavigationSchemaTab';
import {NavigationPreviewTab} from './NavigationPreviewTab/NavigationPreviewTab';

export function useNavigationTableDetail(active: boolean): NavigationDetailConfig {
    const table = useSelector(selectNavigationTable);
    const cluster = useSelector(selectNavigationCluster);
    const path = useSelector(selectNavigationPath);
    const nodeType = useSelector(selectNavigationNodeType);
    const {columns: extraColumns} = useExternalSchemaColumns(
        active && nodeType === BodyType.Table ? cluster : undefined,
        active && nodeType === BodyType.Table ? path : undefined,
    );
    return createTableDetailConfig({
        tabs: [
            {
                id: 'schema',
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
            },
            {id: 'preview', renderContent: () => <NavigationPreviewTab />},
            {id: 'meta', renderContent: () => <MetaTable items={table?.meta ?? []} />},
        ],
    })({path, title: table?.name ?? path});
}
